import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function configDir(): string {
  return path.join(os.homedir(), ".ajo");
}

export function configPath(): string {
  return path.join(configDir(), "config.json");
}

export interface AjoCliConfig {
  secretKey?: string;
  contractId: string;
  rpcUrl: string;
  networkPassphrase: string;
  nativeTokenId: string;
}

const TESTNET_DEFAULTS: Omit<AjoCliConfig, "secretKey"> = {
  contractId: "CCL4M6UACHON7VFUBIXCLY5OGD2HLGAYV63W54MKFJ3UICWCHEBYBWTL",
  rpcUrl: "https://soroban-testnet.stellar.org",
  networkPassphrase: "Test SDF Network ; September 2015",
  nativeTokenId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
};

export function loadConfig(): AjoCliConfig {
  const file = configPath();
  if (!fs.existsSync(file)) {
    return { ...TESTNET_DEFAULTS };
  }
  const raw = fs.readFileSync(file, "utf-8");
  return { ...TESTNET_DEFAULTS, ...JSON.parse(raw) };
}

export function saveConfig(config: AjoCliConfig): void {
  fs.mkdirSync(configDir(), { recursive: true, mode: 0o700 });
  fs.writeFileSync(configPath(), JSON.stringify(config, null, 2), { mode: 0o600 });
}
