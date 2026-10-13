import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

describe("sitemap (#362)", () => {
  it("includes all public site routes with expected URLs", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain("https://ajo.app");
    expect(urls).toContain("https://ajo.app/circles");
    expect(urls).toContain("https://ajo.app/about");
  });

  it("assigns valid change frequencies and priorities to all routes", () => {
    const entries = sitemap();

    for (const entry of entries) {
      expect(entry.url.startsWith("https://ajo.app")).toBe(true);
      expect(typeof entry.changeFrequency).toBe("string");
      expect(typeof entry.priority).toBe("number");
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    }

    const home = entries.find((e) => e.url === "https://ajo.app");
    expect(home?.priority).toBe(1);

    const circles = entries.find((e) => e.url === "https://ajo.app/circles");
    expect(circles?.changeFrequency).toBe("hourly");
    expect(circles?.priority).toBe(0.8);

    const about = entries.find((e) => e.url === "https://ajo.app/about");
    expect(about?.changeFrequency).toBe("yearly");
    expect(about?.priority).toBe(0.5);
  });
});
