import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  RPCCache,
  rpcCache,
  hasContributedCached,
  missedCountCached,
  invalidateCircleCache,
} from "./rpc-cache";

describe("RPCCache", () => {
  beforeEach(() => {
    rpcCache.clear();
  });

  describe("key formatting", () => {
    it("generates correct key format for contributions", () => {
      const cache = new RPCCache();
      const key = cache.contributionKey(1n, 3, "GBEXAMPLE123");
      expect(key).toBe("contrib:1:3:GBEXAMPLE123");
    });

    it("generates correct key format for missed counts", () => {
      const cache = new RPCCache();
      const key = cache.missedKey(42n, "GBEXAMPLE123");
      expect(key).toBe("missed:42:GBEXAMPLE123");
    });
  });

  describe("basic get/set/clear operations", () => {
    it("stores and retrieves cached values", () => {
      const cache = new RPCCache();
      cache.set("key1", { data: 123 });
      expect(cache.get("key1")).toEqual({ data: 123 });
    });

    it("returns null for non-existent keys", () => {
      const cache = new RPCCache();
      expect(cache.get("missing")).toBeNull();
    });

    it("clears all entries on clear()", () => {
      const cache = new RPCCache();
      cache.set("k1", 1);
      cache.set("k2", 2);
      expect(cache.getStats().size).toBe(2);

      cache.clear();
      expect(cache.getStats().size).toBe(0);
      expect(cache.get("k1")).toBeNull();
      expect(cache.get("k2")).toBeNull();
    });

    it("returns stats with size and keys", () => {
      const cache = new RPCCache();
      cache.set("alpha", "a");
      cache.set("beta", "b");

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toEqual(["alpha", "beta"]);
    });
  });

  describe("TTL expiration", () => {
    it("returns cached value before TTL expires", () => {
      vi.useFakeTimers();
      try {
        const cache = new RPCCache(1000);
        cache.set("k", "value");

        vi.advanceTimersByTime(500);
        expect(cache.get("k")).toBe("value");
      } finally {
        vi.useRealTimers();
      }
    });

    it("returns null and evicts entry once TTL expires", () => {
      vi.useFakeTimers();
      try {
        const cache = new RPCCache(1000);
        cache.set("k", "value");

        vi.advanceTimersByTime(1001);
        expect(cache.get("k")).toBeNull();
        expect(cache.getStats().size).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("clearCircle prefix matching (#350)", () => {
    it("clears target circle entries without evicting other circles whose cycle number equals target id", () => {
      const cache = new RPCCache();

      // Circle 2 entries
      const circle2Contrib = cache.contributionKey(2n, 1, "GBMEMBER1");
      const circle2Missed = cache.missedKey(2n, "GBMEMBER1");
      cache.set(circle2Contrib, true);
      cache.set(circle2Missed, 0);

      // Circle 7 entry where cycle number is 2 (would collide under `:${circleId}:` substring matching)
      const circle7Cycle2Contrib = cache.contributionKey(7n, 2, "GBMEMBER2");
      cache.set(circle7Cycle2Contrib, false);

      // Circle 20 entry (would collide if prefix didn't end with ':')
      const circle20Contrib = cache.contributionKey(20n, 1, "GBMEMBER3");
      cache.set(circle20Contrib, true);

      // Invalidate circle 2
      cache.clearCircle(2n);

      // Circle 2 entries must be cleared
      expect(cache.get(circle2Contrib)).toBeNull();
      expect(cache.get(circle2Missed)).toBeNull();

      // Circle 7 (cycle 2) and Circle 20 entries must be preserved
      expect(cache.get(circle7Cycle2Contrib)).toBe(false);
      expect(cache.get(circle20Contrib)).toBe(true);
    });

    it("clears entries via clearPattern for generic substring matches", () => {
      const cache = new RPCCache();
      cache.set("circle:1:foo", 1);
      cache.set("circle:1:bar", 2);
      cache.set("circle:2:baz", 3);

      cache.clearPattern(":1:");
      expect(cache.get("circle:1:foo")).toBeNull();
      expect(cache.get("circle:1:bar")).toBeNull();
      expect(cache.get("circle:2:baz")).toBe(3);
    });
  });
});

describe("rpc-cache helpers and invalidation (#360)", () => {
  beforeEach(() => {
    rpcCache.clear();
  });

  describe("hasContributedCached", () => {
    it("calls underlying function on cache miss and caches the result", async () => {
      const mockFn = vi.fn().mockResolvedValue(true);

      const res1 = await hasContributedCached(mockFn, 1n, 2, "GBTEST");
      expect(res1).toBe(true);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Second call should hit cache
      const res2 = await hasContributedCached(mockFn, 1n, 2, "GBTEST");
      expect(res2).toBe(true);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("re-calls underlying function after invalidateCircleCache is invoked", async () => {
      const mockFn = vi.fn().mockResolvedValue(true);

      await hasContributedCached(mockFn, 5n, 1, "GBTEST");
      expect(mockFn).toHaveBeenCalledTimes(1);

      invalidateCircleCache(5n);

      await hasContributedCached(mockFn, 5n, 1, "GBTEST");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("missedCountCached", () => {
    it("calls underlying function on cache miss and caches the result", async () => {
      const mockFn = vi.fn().mockResolvedValue(3);

      const res1 = await missedCountCached(mockFn, 10n, "GBTEST");
      expect(res1).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Second call hits cache
      const res2 = await missedCountCached(mockFn, 10n, "GBTEST");
      expect(res2).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("re-calls underlying function after invalidateCircleCache is invoked", async () => {
      const mockFn = vi.fn().mockResolvedValue(0);

      await missedCountCached(mockFn, 10n, "GBTEST");
      expect(mockFn).toHaveBeenCalledTimes(1);

      invalidateCircleCache(10n);

      await missedCountCached(mockFn, 10n, "GBTEST");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("invalidateCircleCache singleton integration", () => {
    it("properly isolates invalidation so other circles are not cleared", async () => {
      const fn1 = vi.fn().mockResolvedValue(true);
      const fn2 = vi.fn().mockResolvedValue(false);

      await hasContributedCached(fn1, 2n, 1, "GBMEMBER1");
      // Circle 7 with cycle 2
      await hasContributedCached(fn2, 7n, 2, "GBMEMBER2");

      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);

      // Invalidate circle 2
      invalidateCircleCache(2n);

      // Circle 2 should re-query
      await hasContributedCached(fn1, 2n, 1, "GBMEMBER1");
      expect(fn1).toHaveBeenCalledTimes(2);

      // Circle 7 should still be cached!
      await hasContributedCached(fn2, 7n, 2, "GBMEMBER2");
      expect(fn2).toHaveBeenCalledTimes(1);
    });
  });
});
