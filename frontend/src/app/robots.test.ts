import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots (#362)", () => {
  it("generates correct crawl rules allowing all user agents", () => {
    const config = robots();
    expect(config.rules).toBeDefined();

    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const defaultRule = rules.find((r) => r.userAgent === "*" || (Array.isArray(r.userAgent) && r.userAgent.includes("*")));
    expect(defaultRule).toBeDefined();
    expect(defaultRule?.allow).toBe("/");
  });

  it("points to the canonical sitemap.xml URL", () => {
    const config = robots();
    expect(config.sitemap).toBe("https://ajo.app/sitemap.xml");
  });
});
