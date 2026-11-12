import * as sdk from "@defillama/sdk";
import path from "path";
import { PeggedAsset } from "../../peggedData/types";
import { RECORDED_CONTRACTS_TTL_DAYS, RecordedContracts } from "./contractRecorder";

export type ChainContracts = { [chain: string]: string[] };

// token deployments per chain (display-name keys): chainConfig + bridge-config tokens + addresses the supply pipeline recorded
export async function getChainContracts(asset: PeggedAsset, recorded: RecordedContracts = {}): Promise<ChainContracts | undefined> {
  const byChain: { [chain: string]: Set<string> } = {};
  const add = (chain: string, address: string) => {
    const label = sdk.chainUtils.getChainLabelFromKey(chain);
    (byChain[label] ??= new Set()).add(address);
  };

  for (const [chain, config] of Object.entries(asset.chainConfig?.chains ?? {})) {
    for (const [key, value] of Object.entries(config)) {
      if (!["issued", "cosmosIssued"].includes(key) && !key.startsWith("bridgedFrom") && !key.startsWith("cosmosBridgedFrom")) continue;
      [value].flat().forEach((address) => add(chain, address));
    }
  }

  const key = asset.module ?? asset.gecko_id;
  const dir = key ? path.join(__dirname, "../../adapters/peggedAssets", key) : null;
  const bridgeFiles = [
    [asset.bridgeConfig?.lzConfig, "layerzeroConfig"],
    [asset.bridgeConfig?.hyperlaneConfig, "hyperlaneConfig"],
  ] as const;
  for (const [enabled, file] of bridgeFiles) {
    if (!enabled || !dir) continue;
    try {
      const { sourceChain, tokens } = (await import(path.join(dir, file))).default;
      for (const token of tokens) {
        if (token.chain === sourceChain) continue;
        const config = asset.chainConfig?.chains[token.chain];
        const covered =
          !!config &&
          Object.keys(config).some(
            (k) => k === "issued" || k === "cosmosIssued" || k.toLowerCase() === `bridgedfrom${sourceChain === "ethereum" ? "eth" : sourceChain}`
          );
        if (!covered) add(token.chain, token.address);
      }
    } catch (e) {}
  }

  const cutoff = Date.now() / 1000 - RECORDED_CONTRACTS_TTL_DAYS * 86400;
  for (const [chain, addresses] of Object.entries(recorded[asset.id] ?? {}))
    for (const [address, lastSeen] of Object.entries(addresses)) if (lastSeen >= cutoff) add(chain, address);

  // the asset definition's own address: "chain:address" is unambiguous; a bare EVM address is ethereum unless another source already placed it, other bare ids are skipped
  const bare: string[] = [];
  for (const raw of [asset.address].flat()) {
    const match = raw?.match(/^([a-z0-9_]+):(?!:)(.+)$/i);
    if (match) add(match[1].toLowerCase(), match[2]);
    else if (raw) bare.push(raw);
  }
  const known = new Set(Object.values(byChain).flatMap((addresses) => [...addresses].map((address) => address.toLowerCase())));
  bare.filter((address) => /^0x[0-9a-fA-F]{40}$/.test(address) && !known.has(address.toLowerCase())).forEach((address) => add("ethereum", address));

  const result: ChainContracts = {};
  for (const [chain, addresses] of Object.entries(byChain)) result[chain] = [...addresses];
  return Object.keys(result).length ? result : undefined;
}
