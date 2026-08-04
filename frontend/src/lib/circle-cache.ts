const STORAGE_KEY = "ajo_known_circle_ids";

/**
 * discoverCircleIds() only scans ~7 days of ledger events, so a circle
 * older than that silently drops out of the browse list even though it's
 * still perfectly reachable at /circles/[id]. This is a client-side cache
 * of every id this browser has ever seen — via discovery, direct visit, or
 * creating/joining one — so the list stays complete locally regardless of
 * the RPC lookback window. It's a convenience cache, not a source of
 * truth: every id still gets its live state from the contract.
 */
export function rememberCircleId(id: bigint): void {
  if (typeof window === "undefined") return;
  const known = readKnownIds();
  known.add(id.toString());
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...known]));
}

export function rememberCircleIds(ids: bigint[]): void {
  if (typeof window === "undefined") return;
  const known = readKnownIds();
  for (const id of ids) known.add(id.toString());
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...known]));
}

export function getKnownCircleIds(): bigint[] {
  return [...readKnownIds()].map((id) => BigInt(id));
}

function readKnownIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : []);
  } catch {
    return new Set();
  }
}
