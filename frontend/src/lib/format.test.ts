import { describe, expect, it } from "vitest";
import { formatCycleLength, formatDeadline, formatXlm, shortenAddress, xlmToStroops } from "./format";

describe("formatXlm", () => {
  it("formats a whole number of stroops with no decimal point", () => {
    expect(formatXlm(100_000_000n)).toBe("10");
  });

  it("formats a fractional amount, stripping trailing zeros", () => {
    expect(formatXlm(15_000_000n)).toBe("1.5");
    expect(formatXlm(10_000_001n)).toBe("1.0000001");
  });

  it("formats zero", () => {
    expect(formatXlm(0n)).toBe("0");
  });
});

describe("xlmToStroops", () => {
  it("converts a whole number string", () => {
    expect(xlmToStroops("10")).toBe(100_000_000n);
  });

  it("converts a fractional string", () => {
    expect(xlmToStroops("1.5")).toBe(15_000_000n);
  });

  it("round-trips through formatXlm", () => {
    expect(formatXlm(xlmToStroops("3.25"))).toBe("3.25");
  });
});

describe("shortenAddress", () => {
  const address = "GBWKRNCK4MZIEV37WIXN7W2CTBOEKAJNE5GEVAPIZ6Z3ED7RVB6SR57E";

  it("shortens a full Stellar address to a prefix…suffix", () => {
    expect(shortenAddress(address)).toBe("GBWK…R57E");
  });

  it("leaves a short string unchanged", () => {
    expect(shortenAddress("abc")).toBe("abc");
  });
});

describe("formatCycleLength", () => {
  it("labels one week as weekly", () => {
    expect(formatCycleLength(604_800n)).toBe("weekly");
  });

  it("labels multiple weeks", () => {
    expect(formatCycleLength(1_209_600n)).toBe("every 2 weeks");
  });

  it("labels one day as daily", () => {
    expect(formatCycleLength(86_400n)).toBe("daily");
  });

  it("falls back to raw seconds for an odd cycle length", () => {
    expect(formatCycleLength(3_661n)).toBe("every 3661s");
  });
});

describe("formatDeadline", () => {
  it("reports a passed deadline", () => {
    expect(formatDeadline(Date.now() / 1000 - 10)).toBe("deadline passed");
  });

  it("reports days remaining", () => {
    expect(formatDeadline(Date.now() / 1000 + 2 * 86_400 + 3_600)).toBe("2d 1h left");
  });

  it("reports minutes remaining when under an hour", () => {
    expect(formatDeadline(Date.now() / 1000 + 5 * 60)).toBe("5m left");
  });
});
