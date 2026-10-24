// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { ContractErrorCode } from "@/lib/contract-errors";
import { parseCircleId } from "@/lib/circle-id";

const m = vi.hoisted(() => {
  class ContractCallError extends Error {
    code: unknown;
    constructor(message: string, code: unknown) {
      super(message);
      this.code = code;
    }
  }
  class WalletError extends Error {}
  return {
    ContractCallError,
    WalletError,
    CircleStatus: { Forming: "Forming", Active: "Active", Completed: "Completed", Cancelled: "Cancelled" },
    replace: vi.fn(),
    search: { current: new URLSearchParams() },
    wallet: { address: null as string | null, connectWallet: vi.fn() },
    toast: { success: vi.fn(), error: vi.fn() },
    getCircle: vi.fn(),
    buildJoinCircleTx: vi.fn(),
    submitSignedTx: vi.fn(),
    signWithWallet: vi.fn(),
    rememberCircleId: vi.fn(),
    invalidateCircleCache: vi.fn(),
  };
});

vi.mock("next/link", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ href, children, ...rest }: any) => createElement("a", { href, ...rest }, children),
  };
});
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: m.replace }),
  useSearchParams: () => m.search.current,
}));
vi.mock("sonner", () => ({ toast: m.toast }));
vi.mock("@/components/navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/footer", () => ({ Footer: () => null }));
vi.mock("@/components/ui", async () => {
  const { createElement } = await import("react");
  return {
    Button: ({ children, onClick, disabled }: any) => createElement("button", { onClick, disabled }, children),
    Card: ({ children, role }: any) => createElement("div", { role }, children),
  };
});
vi.mock("@/components/circle-not-found", async () => {
  const { createElement } = await import("react");
  return {
    CircleNotFound: ({ rawId }: any) => createElement("div", null, `not-found:${String(rawId)}`),
  };
});
vi.mock("../[id]/circle-detail-skeleton", async () => {
  const { createElement } = await import("react");
  return { CircleDetailSkeleton: () => createElement("div", null, "skeleton") };
});
vi.mock("@/context/wallet-context", () => ({ useWallet: () => m.wallet }));
vi.mock("@/lib/contract", () => ({
  CircleStatus: m.CircleStatus,
  ContractCallError: m.ContractCallError,
  NATIVE_TOKEN_ID: "native",
  getCircle: m.getCircle,
  buildJoinCircleTx: m.buildJoinCircleTx,
  submitSignedTx: m.submitSignedTx,
}));
vi.mock("@/lib/wallet", () => ({
  WalletError: m.WalletError,
  signWithWallet: m.signWithWallet,
}));
vi.mock("@/lib/circle-cache", () => ({ rememberCircleId: m.rememberCircleId }));
vi.mock("@/lib/rpc-cache", () => ({ invalidateCircleCache: m.invalidateCircleCache }));
vi.mock("@/lib/format", () => ({
  assetLabel: () => "XLM",
  formatCount: (n: unknown) => String(n),
  formatCycleLength: () => "7 days",
  formatXlm: (n: unknown) => String(n),
}));

import JoinCirclePage from "./page";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function renderPage(id: string | null) {
  m.search.current = id === null ? new URLSearchParams() : new URLSearchParams({ id });
  await act(async () => {
    root.render(createElement(JoinCirclePage));
  });
  await flush();
}

const text = () => container.textContent ?? "";
const joinButton = () =>
  Array.from(container.querySelectorAll("button")).find((b) => b.textContent?.includes("Join this circle"));

function makeCircle(overrides: Record<string, unknown> = {}) {
  return {
    id: 7n,
    status: m.CircleStatus.Forming,
    members: ["GOTHER"],
    maxMembers: 5,
    contributionAmount: 100n,
    token: "native",
    cycleLengthSecs: 604800,
    ...overrides,
  };
}

async function clickJoin() {
  await act(async () => {
    joinButton()!.click();
  });
  await flush();
}

beforeEach(() => {
  vi.resetAllMocks();
  m.wallet.address = null;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
});

describe("JoinCirclePage: invite link resolution", () => {
  it("rejects a missing id without calling the contract", async () => {
    await renderPage(null);
    expect(text()).toContain("not-found:null");
    expect(m.getCircle).not.toHaveBeenCalled();
  });

  it("rejects a malformed id without calling the contract", async () => {
    expect(parseCircleId("abc")).toBeNull();
    await renderPage("abc");
    expect(text()).toContain("not-found:abc");
    expect(m.getCircle).not.toHaveBeenCalled();
  });

  it("shows a skeleton while the circle is being checked", async () => {
    m.getCircle.mockReturnValue(new Promise(() => {}));
    await renderPage("7");
    expect(text()).toContain("skeleton");
  });

  it("shows not-found when the contract reports CircleNotFound", async () => {
    m.getCircle.mockRejectedValue(new m.ContractCallError("missing", ContractErrorCode.CircleNotFound));
    await renderPage("7");
    expect(text()).toContain("not-found:7");
  });

  it("shows an alert with the message on a generic error", async () => {
    m.getCircle.mockRejectedValue(new Error("RPC down"));
    await renderPage("7");
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(text()).toContain("RPC down");
    expect(text()).not.toContain("not-found");
  });

  it("treats other contract errors as errors, not not-found", async () => {
    m.getCircle.mockRejectedValue(new m.ContractCallError("Contract exploded", "OTHER"));
    await renderPage("7");
    expect(text()).toContain("Contract exploded");
    expect(text()).not.toContain("not-found");
  });

  it("falls back to a default message for non-Error rejections", async () => {
    m.getCircle.mockRejectedValue("boom");
    await renderPage("7");
    expect(text()).toContain("Could not load this circle.");
  });

  it("renders the circle, looks it up by the parsed id and remembers it", async () => {
    m.getCircle.mockResolvedValue(makeCircle());
    await renderPage("7");
    expect(m.getCircle).toHaveBeenCalledWith(parseCircleId("7"));
    expect(m.rememberCircleId).toHaveBeenCalledWith(parseCircleId("7"));
    expect(text()).toContain("Join circle #7");
    expect(text()).toContain("1/5");
    expect(joinButton()).toBeDefined();
  });
});

describe("JoinCirclePage: joining", () => {
  beforeEach(() => {
    m.getCircle.mockResolvedValue(makeCircle());
    m.buildJoinCircleTx.mockResolvedValue("unsigned");
    m.signWithWallet.mockResolvedValue("signed");
    m.submitSignedTx.mockResolvedValue(undefined);
  });

  it("joins, invalidates the cache and redirects to the circle on success", async () => {
    m.wallet.address = "GME";
    await renderPage("7");
    await clickJoin();

    expect(m.buildJoinCircleTx).toHaveBeenCalledWith(7n, "GME");
    expect(m.signWithWallet).toHaveBeenCalledWith("unsigned", "GME");
    expect(m.submitSignedTx).toHaveBeenCalledWith("signed");
    expect(m.toast.success).toHaveBeenCalledWith("Joined circle");
    expect(m.invalidateCircleCache).toHaveBeenCalledWith(7n);
    expect(m.replace).toHaveBeenCalledWith("/circles/7");
  });

  it("connects the wallet first when none is connected", async () => {
    m.wallet.connectWallet.mockResolvedValue("GNEW");
    await renderPage("7");
    await clickJoin();

    expect(m.wallet.connectWallet).toHaveBeenCalledTimes(1);
    expect(m.buildJoinCircleTx).toHaveBeenCalledWith(7n, "GNEW");
    expect(m.replace).toHaveBeenCalledWith("/circles/7");
  });

  it("shows the contract error and does not redirect when joining fails", async () => {
    m.wallet.address = "GME";
    m.submitSignedTx.mockRejectedValue(new m.ContractCallError("Circle is full", "X"));
    await renderPage("7");
    await clickJoin();

    expect(m.toast.error).toHaveBeenCalledWith("Circle is full");
    expect(m.replace).not.toHaveBeenCalled();
    expect(m.invalidateCircleCache).not.toHaveBeenCalled();
  });

  it("shows a wallet error message when signing is rejected", async () => {
    m.wallet.address = "GME";
    m.signWithWallet.mockRejectedValue(new m.WalletError("User declined"));
    await renderPage("7");
    await clickJoin();

    expect(m.toast.error).toHaveBeenCalledWith("User declined");
    expect(m.submitSignedTx).not.toHaveBeenCalled();
    expect(m.replace).not.toHaveBeenCalled();
  });

  it("falls back to a generic message for unknown join errors", async () => {
    m.wallet.address = "GME";
    m.buildJoinCircleTx.mockRejectedValue(new Error("secret internal detail"));
    await renderPage("7");
    await clickJoin();

    expect(m.toast.error).toHaveBeenCalledWith("Could not join circle.");
    expect(m.replace).not.toHaveBeenCalled();
  });
});

describe("JoinCirclePage: join availability", () => {
  it("hides the join button for an existing member", async () => {
    m.wallet.address = "GOTHER";
    m.getCircle.mockResolvedValue(makeCircle());
    await renderPage("7");
    expect(joinButton()).toBeUndefined();
    expect(text()).toContain("already a member");
  });

  it("hides the join button when the circle is full", async () => {
    m.getCircle.mockResolvedValue(makeCircle({ members: ["A", "B", "C", "D", "E"] }));
    await renderPage("7");
    expect(joinButton()).toBeUndefined();
    expect(text()).toContain("already full");
  });

  it("hides the join button once the circle is active", async () => {
    m.getCircle.mockResolvedValue(makeCircle({ status: m.CircleStatus.Active }));
    await renderPage("7");
    expect(joinButton()).toBeUndefined();
    expect(text()).toContain("already active");
  });
});