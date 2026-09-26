// --cycle-secs validation tests.
import { describe, expect, it } from "vitest";
import { parseCycleSecs } from "./validate";

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
