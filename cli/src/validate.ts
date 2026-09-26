// CLI flag validation helpers.

/**
 * Parse `--cycle-secs` into a BigInt. `BigInt()` on arbitrary input throws a
 * raw `SyntaxError: Cannot convert abc to a BigInt`, so validate the string
 * first and throw a clear message the top-level handler can print as-is.
 */
export function parseCycleSecs(value: string): bigint {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`--cycle-secs must be a whole number of seconds (got "${value}").`);
  }
  const secs = BigInt(trimmed);
  if (secs === 0n) {
    throw new Error("--cycle-secs must be greater than 0.");
  }
  return secs;
}
