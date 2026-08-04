import { beforeEach, describe, expect, it } from "vitest";
import { getKnownCircleIds, rememberCircleId, rememberCircleIds } from "./circle-cache";

function installMockLocalStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
      clear: () => void store.clear(),
    },
  });
}

describe("circle-cache", () => {
  beforeEach(() => {
    installMockLocalStorage();
  });

  it("returns an empty list when nothing has been remembered", () => {
    expect(getKnownCircleIds()).toEqual([]);
  });

  it("remembers a single id", () => {
    rememberCircleId(5n);
    expect(getKnownCircleIds()).toEqual([5n]);
  });

  it("remembers a batch of ids and de-duplicates across calls", () => {
    rememberCircleIds([1n, 2n, 3n]);
    rememberCircleIds([2n, 3n, 4n]);
    expect(new Set(getKnownCircleIds())).toEqual(new Set([1n, 2n, 3n, 4n]));
  });

  it("ignores corrupted storage instead of throwing", () => {
    window.localStorage.setItem("ajo_known_circle_ids", "not valid json");
    expect(getKnownCircleIds()).toEqual([]);
  });
});
