// --cycle-secs validation tests.
import { describe, expect, it } from "vitest";
import { parseCycleSecs, parseMembers } from "./validate";

describe("parseCycleSecs", () => {
  it("parses whole numbers of seconds", () => {
    expect(parseCycleSecs("604800")).toBe(604800n);
    expect(parseCycleSecs(" 60 ")).toBe(60n);
  });

  it("rejects non-numeric input with a friendly message", () => {
    for (const bad of ["abc", "", "1.5", "-5", "1e3", "0x10"]) {
      expect(() => parseCycleSecs(bad)).toThrow(/--cycle-secs must be a whole number of seconds/);
    }
  });

  it("rejects zero", () => {
    expect(() => parseCycleSecs("0")).toThrow("--cycle-secs must be greater than 0.");
  });
});

describe("parseMembers", () => {
  it("parses a valid member count", () => {
    expect(parseMembers("2")).toBe(2);
    expect(parseMembers(" 12 ")).toBe(12);
  });

  it("rejects zero, one and negative counts", () => {
    expect(() => parseMembers("0")).toThrow("--members must be at least 2.");
    expect(() => parseMembers("1")).toThrow("--members must be at least 2.");
    expect(() => parseMembers("-3")).toThrow(/--members must be a whole number/);
  });

  it("rejects non-numeric input", () => {
    for (const bad of ["abc", "", "2.5", "1e3", "0x10"]) {
      expect(() => parseMembers(bad)).toThrow(/--members must be a whole number/);
    }
  });

  it("rejects counts above the on-chain u32 maximum", () => {
    expect(() => parseMembers("4294967296")).toThrow("--members must be at most 4294967295.");
  });
});
