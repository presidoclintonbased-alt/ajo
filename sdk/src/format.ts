// XLM <-> stroop conversion, shared by the CLI and frontend (#107).
export const STROOPS_PER_XLM = 10_000_000n;

/** Format a stroop amount as XLM, trimming trailing zeros ("15000000" -> "1.5"). */
export function formatXlm(stroops: bigint): string {
  const whole = stroops / STROOPS_PER_XLM;
  const frac = stroops % STROOPS_PER_XLM;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(7, "0").replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}

/** Parse a decimal XLM string into stroops, truncating past 7 decimal places. */
export function xlmToStroops(xlm: string): bigint {
  const [whole, frac = ""] = xlm.trim().split(".");
  const paddedFrac = (frac + "0000000").slice(0, 7);
  return BigInt(whole || "0") * STROOPS_PER_XLM + BigInt(paddedFrac || "0");
}
