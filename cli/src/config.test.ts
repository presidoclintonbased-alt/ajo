import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("config", () => {
  let tmpHome: string;
  const originalHome = process.env.HOME;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "ajo-cli-test-"));
    process.env.HOME = tmpHome;
  });

  afterEach(() => {
    process.env.HOME = originalHome;
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  it("returns testnet defaults when no config file exists yet", async () => {
    const { loadConfig } = await import("./config");
    const config = loadConfig();
    expect(config.secretKey).toBeUndefined();
    expect(config.contractId).toMatch(/^C[A-Z0-9]{55}$/);
    expect(config.rpcUrl).toBe("https://soroban-testnet.stellar.org");
  });

  it("round-trips a saved config, including the secret key", async () => {
    const { loadConfig, saveConfig } = await import("./config");
    const config = loadConfig();
    saveConfig({ ...config, secretKey: "STESTSECRET" });

    const reloaded = loadConfig();
    expect(reloaded.secretKey).toBe("STESTSECRET");
  });

  it("writes the config file with owner-only permissions", async () => {
    const { loadConfig, saveConfig, configPath } = await import("./config");
    saveConfig(loadConfig());
    const stat = fs.statSync(configPath());
    expect(stat.mode & 0o777).toBe(0o600);
  });
});
