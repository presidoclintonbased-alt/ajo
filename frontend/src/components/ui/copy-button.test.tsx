import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { CopyButton } from "./copy-button";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("CopyButton (#361)", () => {
  let container: HTMLDivElement;
  let root: Root;
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it("renders with default label 'Copy'", async () => {
    await act(async () => {
      root.render(createElement(CopyButton, { value: "test-stellar-address" }));
    });

    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button?.textContent).toContain("Copy");
    expect(button?.getAttribute("aria-label")).toBeNull();
  });

  it("renders with custom label and className", async () => {
    await act(async () => {
      root.render(createElement(CopyButton, { value: "addr", label: "Copy Key", className: "custom-btn-class" }));
    });

    const button = container.querySelector("button");
    expect(button?.textContent).toContain("Copy Key");
    expect(button?.className).toContain("custom-btn-class");
  });

  it("renders icon-only with accessible aria-label", async () => {
    await act(async () => {
      root.render(createElement(CopyButton, { value: "addr", label: "" }));
    });

    const button = container.querySelector("button");
    expect(button?.getAttribute("aria-label")).toBe("Copy to clipboard");
    expect(button?.textContent).toBe("");
  });

  it("copies value to clipboard and shows copied state then resets after 1500ms", async () => {
    vi.useFakeTimers();

    await act(async () => {
      root.render(createElement(CopyButton, { value: "secret-or-address", label: "Copy" }));
    });

    const button = container.querySelector("button")!;

    await act(async () => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(writeTextMock).toHaveBeenCalledWith("secret-or-address");
    expect(button.textContent).toContain("Copied");

    // Fast-forward 1500ms
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(button.textContent).toContain("Copy");
  });

  it("handles icon-only copied state and aria-label transitions", async () => {
    vi.useFakeTimers();

    await act(async () => {
      root.render(createElement(CopyButton, { value: "token-id", label: "" }));
    });

    const button = container.querySelector("button")!;
    expect(button.getAttribute("aria-label")).toBe("Copy to clipboard");

    await act(async () => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(button.getAttribute("aria-label")).toBe("Copied to clipboard");

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(button.getAttribute("aria-label")).toBe("Copy to clipboard");
  });

  it("shows error toast, failure state and resets when clipboard.writeText fails", async () => {
    vi.useFakeTimers();
    writeTextMock.mockRejectedValueOnce(new Error("Clipboard permission denied"));

    await act(async () => {
      root.render(createElement(CopyButton, { value: "fail-value", label: "Copy" }));
    });

    const button = container.querySelector("button")!;

    await act(async () => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(toast.error).toHaveBeenCalledWith("Couldn't copy to clipboard. Please copy it manually.");
    expect(button.textContent).toContain("Copy failed");

    // Fast-forward 1500ms to verify reset
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(button.textContent).toContain("Copy");
  });

  it("updates icon-only aria-label to 'Copy to clipboard failed' on error", async () => {
    vi.useFakeTimers();
    writeTextMock.mockRejectedValueOnce(new Error("Insecure context"));

    await act(async () => {
      root.render(createElement(CopyButton, { value: "fail-value", label: "" }));
    });

    const button = container.querySelector("button")!;

    await act(async () => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(button.getAttribute("aria-label")).toBe("Copy to clipboard failed");

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(button.getAttribute("aria-label")).toBe("Copy to clipboard");
  });
});
