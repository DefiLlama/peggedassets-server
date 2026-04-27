import { PeggedIssuanceAdapter, PeggedAssetType, Balances } from "../peggedAsset.type";
import { ChainApi } from "@defillama/sdk";
import { bridgedSupply, getApi } from "./getSupply";
import { sumSingleBalance } from "./generalUtil";

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

  // Group tokens by destination chain. LZ metadata can list multiple distinct
  // deployments on the same chain (e.g. harmony USDC has 3 ERC20 variants with
  // different decimals) — all of them contribute to bridged supply and must be
  // summed, not skipped as duplicates.
  const byChain = new Map<string, LayerZeroToken[]>();
  for (const token of tokens) {
    if (token.chain === sourceChain) continue;
    const list = byChain.get(token.chain) ?? [];
    list.push(token);
    byChain.set(token.chain, list);
  }

  for (const [chain, chainTokens] of byChain) {
    adapter[chain] = adapter[chain] ?? {};
    if (adapter[chain][sourceChain]) {
      console.log(
        `[bridgeConfig] skipping ${bridgeName} entry for ${chain}.${sourceChain} (${chainTokens.length} token${chainTokens.length === 1 ? "" : "s"}); manual entry exists`
      );
      continue;
    }
    if (adapter[chain].minted) {
      // Chain has a native `minted` entry — treating this token as bridged-from-source
      // would both double-count the chain's own circulating and negatively subtract
      // from the source chain's circulating. Skip.
      console.log(
        `[bridgeConfig] skipping ${bridgeName} entry for ${chain}.${sourceChain} (${chainTokens.length} token${chainTokens.length === 1 ? "" : "s"}); chain already has native minted`
      );
      continue;
    }
    adapter[chain][sourceChain] = buildLayerZeroFetcher(
      chain,
      chainTokens,
      bridgeName,
      sourceChain,
      pegType
    );
  }
}

function buildLayerZeroFetcher(
  chain: string,
  tokens: LayerZeroToken[],
  bridgeName: string,
  sourceChain: string,
  pegType: string | undefined
) {
  if (tokens.length === 1) {
    const t = tokens[0];
    return bridgedSupply(
      chain,
      t.decimals,
      [t.address],
      bridgeName,
      sourceChain,
      pegType as PeggedAssetType
    );
  }

  // Multiple tokens on the same chain (distinct deployments of the same asset,
  // e.g. three ERC20 USDC variants on harmony). Sum all of them with one
  // multicall, applying per-token decimals.
  const assetPegType = (pegType ?? "peggedUSD") as PeggedAssetType;
  return async function (_api: ChainApi) {
    const api = await getApi(chain, _api);
    const balances: Balances = {} as Balances;
    const addresses = tokens.map((t) => t.address);
    const supplies = await api.multiCall({ abi: "erc20:totalSupply", calls: addresses });
    for (let i = 0; i < supplies.length; i++) {
      sumSingleBalance(
        balances,
        assetPegType,
        supplies[i] / 10 ** tokens[i].decimals,
        bridgeName,
        false,
        sourceChain
      );
    }
    return balances;
  };
}
