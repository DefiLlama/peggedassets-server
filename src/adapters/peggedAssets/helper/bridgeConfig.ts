import { PeggedIssuanceAdapter } from "../peggedAsset.type";
import { bridgedSupply } from "./getSupply";

export type LayerZeroToken = {
  chain: string;
  address: string;
  decimals: number;
};

export type LayerZeroConfig = {
  sourceChain: string;
  tokens: LayerZeroToken[];
  bridgeName?: string;
  pegType?: string;
};

export type BridgeConfigs = {
  layerzero?: LayerZeroConfig;
};

export function addBridgeConfigs(
  adapter: PeggedIssuanceAdapter,
  configs: BridgeConfigs
): PeggedIssuanceAdapter {
  if (configs.layerzero) applyLayerZero(adapter, configs.layerzero);
  return adapter;
}

function applyLayerZero(
  adapter: PeggedIssuanceAdapter,
  config: LayerZeroConfig
) {
  const bridgeName = config.bridgeName ?? "layerzero";
  const { sourceChain, tokens, pegType } = config;

  for (const token of tokens) {
    const { chain, address, decimals } = token;
    if (chain === sourceChain) continue;
    adapter[chain] = adapter[chain] ?? {};
    if (adapter[chain][sourceChain]) {
      console.log(
        `[bridgeConfig] skipping ${bridgeName} entry for ${chain}.${sourceChain} (${address}); manual entry exists`
      );
      continue;
    }
    if (adapter[chain].minted) {
      // Chain has a native `minted` entry — treating this token as bridged-from-source
      // would both double-count the chain's own circulating and negatively subtract
      // from the source chain's circulating. Skip.
      console.log(
        `[bridgeConfig] skipping ${bridgeName} entry for ${chain}.${sourceChain} (${address}); chain already has native minted`
      );
      continue;
    }
    adapter[chain][sourceChain] = bridgedSupply(
      chain,
      decimals,
      [address],
      bridgeName,
      sourceChain,
      pegType as any
    );
  }
}
