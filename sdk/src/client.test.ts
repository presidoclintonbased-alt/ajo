import { describe, expect, it } from "vitest";
import { AjoClient, AjoContractError, CircleStatus } from "./client";

describe("AjoContractError", () => {
  it("is a real Error subclass with a stable name for narrowing", () => {
    const error = new AjoContractError("simulation failed");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AjoContractError");
    expect(error.message).toBe("simulation failed");
  });
});

describe("CircleStatus", () => {
  it("matches the contract's discriminant values exactly", () => {
    // These are load-bearing: scValToNative decodes the contract's enum to
    // a plain number, and callers compare it against this enum by value.
    // A mismatch here would silently misclassify every circle's status.
    expect(CircleStatus.Forming).toBe(0);
    expect(CircleStatus.Active).toBe(1);
    expect(CircleStatus.Completed).toBe(2);
    expect(CircleStatus.Cancelled).toBe(3);
  });
});

describe("AjoClient", () => {
  it("constructs with just a contract id, defaulting to testnet", () => {
    expect(() => new AjoClient({ contractId: "CCL4M6UACHON7VFUBIXCLY5OGD2HLGAYV63W54MKFJ3UICWCHEBYBWTL" })).not.toThrow();
  });

  it("accepts a custom rpc url and network passphrase", () => {
    expect(
      () =>
        new AjoClient({
          contractId: "CCL4M6UACHON7VFUBIXCLY5OGD2HLGAYV63W54MKFJ3UICWCHEBYBWTL",
          rpcUrl: "https://soroban-mainnet.example.org",
          networkPassphrase: "Public Global Stellar Network ; September 2015",
        }),
    ).not.toThrow();
  });
});
