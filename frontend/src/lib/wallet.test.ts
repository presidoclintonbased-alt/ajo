import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAddress, isConnected, signTransaction } from "@stellar/freighter-api";
import { connectWallet, signWithWallet, WalletError } from "./wallet";

vi.mock("@stellar/freighter-api", () => ({
  isConnected: vi.fn(),
  getAddress: vi.fn(),
  signTransaction: vi.fn(),
}));

const mockIsConnected = vi.mocked(isConnected);
const mockGetAddress = vi.mocked(getAddress);
const mockSignTransaction = vi.mocked(signTransaction);

describe("wallet (#359)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("WalletError", () => {
    it("is an instance of Error", () => {
      const err = new WalletError("Test error");
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("Test error");
    });
  });

  describe("connectWallet", () => {
    it("returns the public key address when connected successfully", async () => {
      mockIsConnected.mockResolvedValue({ isConnected: true } as never);
      mockGetAddress.mockResolvedValue({ address: "GBALICE12345" } as never);

      const address = await connectWallet();
      expect(address).toBe("GBALICE12345");
      expect(mockIsConnected).toHaveBeenCalledTimes(1);
      expect(mockGetAddress).toHaveBeenCalledTimes(1);
    });

    it("throws WalletError when the Freighter extension is missing", async () => {
      mockIsConnected.mockResolvedValue({ isConnected: false } as never);

      await expect(connectWallet()).rejects.toThrow(
        new WalletError("No Stellar wallet found. Install the Freighter browser extension to continue."),
      );
      expect(mockGetAddress).not.toHaveBeenCalled();
    });

    it("throws WalletError when isConnected returns an error", async () => {
      mockIsConnected.mockResolvedValue({ error: new Error("Extension blocked"), isConnected: false } as never);

      await expect(connectWallet()).rejects.toThrow(
        new WalletError("No Stellar wallet found. Install the Freighter browser extension to continue."),
      );
      expect(mockGetAddress).not.toHaveBeenCalled();
    });

    it("throws WalletError with custom message when getAddress returns an error", async () => {
      mockIsConnected.mockResolvedValue({ isConnected: true } as never);
      mockGetAddress.mockResolvedValue({ error: { message: "User rejected connection request" } } as never);

      await expect(connectWallet()).rejects.toThrow("User rejected connection request");
    });

    it("throws default WalletError message when getAddress returns no address without message", async () => {
      mockIsConnected.mockResolvedValue({ isConnected: true } as never);
      mockGetAddress.mockResolvedValue({ address: "" } as never);

      await expect(connectWallet()).rejects.toThrow("Could not read your wallet address.");
    });
  });

  describe("signWithWallet", () => {
    const UNSIGNED_XDR = "AAAAAG1vY2steGRy";
    const ADDRESS = "GBALICE12345";
    const EXPECTED_PASSPHRASE = "Test SDF Network ; September 2015";

    it("signs transaction passing unsignedXdr, networkPassphrase and address", async () => {
      const SIGNED_XDR = "AAAAAHNpZ25lZC14ZHI=";
      mockSignTransaction.mockResolvedValue({ signedTxXdr: SIGNED_XDR } as never);

      const result = await signWithWallet(UNSIGNED_XDR, ADDRESS);
      expect(result).toBe(SIGNED_XDR);
      expect(mockSignTransaction).toHaveBeenCalledWith(UNSIGNED_XDR, {
        networkPassphrase: EXPECTED_PASSPHRASE,
        address: ADDRESS,
      });
    });

    it("throws WalletError with custom message when signing fails with error message", async () => {
      mockSignTransaction.mockResolvedValue({
        error: { message: "User declined signature" },
      } as never);

      await expect(signWithWallet(UNSIGNED_XDR, ADDRESS)).rejects.toThrow("User declined signature");
    });

    it("throws default WalletError message when signedTxXdr is missing without error message", async () => {
      mockSignTransaction.mockResolvedValue({ signedTxXdr: "" } as never);

      await expect(signWithWallet(UNSIGNED_XDR, ADDRESS)).rejects.toThrow(
        "Wallet signing was cancelled or failed.",
      );
    });
  });
});
