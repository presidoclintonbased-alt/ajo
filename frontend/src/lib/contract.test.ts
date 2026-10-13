import { describe, expect, it, vi } from "vitest";
import { sendWithRetry, submitSignedTx, ContractCallError, server } from "./contract";

describe("sendWithRetry (#150)", () => {
  function mockServer(sendTransaction: (...args: unknown[]) => unknown) {
    return { sendTransaction } as unknown as Parameters<typeof sendWithRetry>[0];
  }

  it("returns immediately on PENDING without retrying", async () => {
    const sendTransaction = vi.fn().mockResolvedValue({ status: "PENDING", hash: "abc" });
    const result = await sendWithRetry(mockServer(sendTransaction), {} as never);
    expect(result.status).toBe("PENDING");
    expect(sendTransaction).toHaveBeenCalledTimes(1);
  });

  it("returns DUPLICATE as-is without retrying, so the caller proceeds to polling", async () => {
    const sendTransaction = vi.fn().mockResolvedValue({ status: "DUPLICATE", hash: "abc" });
    const result = await sendWithRetry(mockServer(sendTransaction), {} as never);
    expect(result.status).toBe("DUPLICATE");
    expect(sendTransaction).toHaveBeenCalledTimes(1);
  });

  it("returns ERROR as-is without retrying", async () => {
    const sendTransaction = vi.fn().mockResolvedValue({ status: "ERROR", hash: "abc" });
    const result = await sendWithRetry(mockServer(sendTransaction), {} as never);
    expect(result.status).toBe("ERROR");
    expect(sendTransaction).toHaveBeenCalledTimes(1);
  });

  it("retries with backoff on TRY_AGAIN_LATER, then returns the eventual success", async () => {
    vi.useFakeTimers();
    try {
      const sendTransaction = vi
        .fn()
        .mockResolvedValueOnce({ status: "TRY_AGAIN_LATER", hash: "abc" })
        .mockResolvedValueOnce({ status: "TRY_AGAIN_LATER", hash: "abc" })
        .mockResolvedValueOnce({ status: "PENDING", hash: "abc" });

      const promise = sendWithRetry(mockServer(sendTransaction), {} as never);
      // Two backoff delays (500ms, 1000ms) must elapse between the three calls.
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;
      expect(result.status).toBe("PENDING");
      expect(sendTransaction).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it("gives up after the max retry attempts, returning the last TRY_AGAIN_LATER response", async () => {
    vi.useFakeTimers();
    try {
      const sendTransaction = vi.fn().mockResolvedValue({ status: "TRY_AGAIN_LATER", hash: "abc" });
      const promise = sendWithRetry(mockServer(sendTransaction), {} as never);
      await vi.advanceTimersByTimeAsync(60_000);

      const result = await promise;
      expect(result.status).toBe("TRY_AGAIN_LATER");
      // 1 initial attempt + 5 retries = 6 total calls.
      expect(sendTransaction).toHaveBeenCalledTimes(6);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("submitSignedTx (#354)", () => {
  const MOCK_SIGNED_XDR =
    "AAAAAgAAAAA7aie8zrakLWKjqNAqbw1zZTIVdx3iQ6Y6wEihi1naKQAAAAAAAAAAAAAAZQAAAAEAAAAAAAAAAAAAAABqzm6lAAAAAAAAAAAAAAAAAAAAAYtZ2ikAAABAWCWXhFxpfyFINHdcpqkSKpUWV8JdAnXBUU6PyDLtHbD2fG0QkSTMxbpXCZOKIqrFpqeHLc+pPeH+c78SiA4cCA==";

  it("tolerates transient errors mid-poll and recovers when transaction lands", async () => {
    vi.useFakeTimers();
    try {
      vi.spyOn(server, "sendTransaction").mockResolvedValue({ status: "PENDING", hash: "test-hash-1" } as never);
      const getTxSpy = vi
        .spyOn(server, "getTransaction")
        .mockRejectedValueOnce(new Error("502 Bad Gateway"))
        .mockResolvedValueOnce({ status: "SUCCESS", returnValue: undefined } as never);

      const promise = submitSignedTx(MOCK_SIGNED_XDR);
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;
      expect(result).toBeUndefined();
      expect(getTxSpy).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("throws ContractCallError when transaction is rejected immediately", async () => {
    vi.spyOn(server, "sendTransaction").mockResolvedValue({
      status: "ERROR",
      errorResult: "tx_bad_auth",
    } as never);

    await expect(submitSignedTx(MOCK_SIGNED_XDR)).rejects.toThrow(ContractCallError);
  });

  it("throws ContractCallError when transaction is NOT_FOUND after max polling attempts", async () => {
    vi.useFakeTimers();
    try {
      vi.spyOn(server, "sendTransaction").mockResolvedValue({ status: "PENDING", hash: "test-hash-2" } as never);
      vi.spyOn(server, "getTransaction").mockResolvedValue({ status: "NOT_FOUND" } as never);

      const promise = submitSignedTx(MOCK_SIGNED_XDR);
      const rejection = expect(promise).rejects.toThrow(/was not found on-chain after 40 polls/);
      await vi.advanceTimersByTimeAsync(70_000);
      await rejection;
    } finally {
      vi.useRealTimers();
    }
  });

  it("re-throws mid-poll error if every attempt up to the max budget fails", async () => {
    vi.useFakeTimers();
    try {
      vi.spyOn(server, "sendTransaction").mockResolvedValue({ status: "PENDING", hash: "test-hash-3" } as never);
      vi.spyOn(server, "getTransaction").mockRejectedValue(new Error("Persistent RPC connection reset"));

      const promise = submitSignedTx(MOCK_SIGNED_XDR);
      const rejection = expect(promise).rejects.toThrow("Persistent RPC connection reset");
      await vi.advanceTimersByTimeAsync(70_000);
      await rejection;
    } finally {
      vi.useRealTimers();
    }
  });
});
