import * as sdk from "@defillama/sdk";
import path from "path";
import manualChainContracts from "../../peggedData/chainContracts";
import { PeggedAsset } from "../../peggedData/types";

export type ChainContracts = { [chain: string]: string[] };

// token deployments per chain (display-name keys): chainConfig or the manual map, plus bridge-config tokens
export async function getChainContracts(asset: PeggedAsset): Promise<ChainContracts | undefined> {
  const byChain: { [chain: string]: Set<string> } = {};
  const add = (chain: string, address: string) => {
    const label = sdk.chainUtils.getChainLabelFromKey(chain);
    (byChain[label] ??= new Set()).add(address);
  };

  const manual = manualChainContracts[asset.id];
  if (manual) {
    for (const [chain, addresses] of Object.entries(manual)) addresses.forEach((address) => add(chain, address));
  } else if (asset.chainConfig) {
    for (const [chain, config] of Object.entries(asset.chainConfig.chains)) {
      for (const [key, value] of Object.entries(config)) {
        if (key !== "issued" && !key.startsWith("bridgedFrom")) continue;
        [value].flat().forEach((address) => add(chain, address));
      }
    }
  } else return undefined;

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
        const covered = config
          ? Object.keys(config).some(
              (k) => k === "issued" || k === "cosmosIssued" || k.toLowerCase() === `bridgedfrom${sourceChain === "ethereum" ? "eth" : sourceChain}`
            )
          : !!manual?.[token.chain];
        if (!covered) add(token.chain, token.address);
      }
    } catch (e) {}
  }

  const result: ChainContracts = {};
  for (const [chain, addresses] of Object.entries(byChain)) result[chain] = [...addresses];
  return Object.keys(result).length ? result : undefined;
}
