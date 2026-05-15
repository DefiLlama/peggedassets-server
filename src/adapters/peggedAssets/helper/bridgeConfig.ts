import { PeggedIssuanceAdapter, PeggedAssetType, Balances } from "../peggedAsset.type";
import { ChainApi } from "@defillama/sdk";
import { bridgedSupply, getApi } from "./getSupply";
import { sumSingleBalance } from "./generalUtil";

type BridgeToken = {
  chain: string;
  address: string;
  decimals: number;
};

export type LayerZeroToken = BridgeToken;

export type LayerZeroConfig = {
  sourceChain: string;
  tokens: LayerZeroToken[];
  bridgeName?: string;
  pegType?: string;
};

export type HyperlaneToken = BridgeToken;

export type HyperlaneConfig = {
  sourceChain: string;
  tokens: HyperlaneToken[];
  bridgeName?: string;
  pegType?: string;
};

export type BridgeConfigs = {
  layerzero?: LayerZeroConfig;
  hyperlane?: HyperlaneConfig;
};

type BridgeContribution = {
  bridgeName: string;
  pegType?: string;
  tokens: BridgeToken[];
};

type DestinationGroup = {
  destinationChain: string;
  sourceChain: string;
  contributions: BridgeContribution[];
};

export function addBridgeConfigs(
  adapter: PeggedIssuanceAdapter,
  configs: BridgeConfigs
): PeggedIssuanceAdapter {
  const groupsByDestination = collectContributionsByDestination(configs);

  for (const group of groupsByDestination.values()) {
    applyDestinationGroup(adapter, group);
  }

  return adapter;
}

function collectContributionsByDestination(
  configs: BridgeConfigs
): Map<string, DestinationGroup> {
  const groups = new Map<string, DestinationGroup>();

  enrollBridge(groups, configs.layerzero, "layerzero");
  enrollBridge(groups, configs.hyperlane, "hyperlane");

  return groups;
}

function enrollBridge(
  groups: Map<string, DestinationGroup>,
  config: LayerZeroConfig | HyperlaneConfig | undefined,
  defaultBridgeName: string
) {
  if (!config) return;

  const bridgeName = config.bridgeName ?? defaultBridgeName;
  const { sourceChain, tokens, pegType } = config;
  const tokensByDestinationChain = new Map<string, BridgeToken[]>();

  for (const token of tokens) {
    if (token.chain === sourceChain) continue;
    const existing = tokensByDestinationChain.get(token.chain) ?? [];
    existing.push(token);
    tokensByDestinationChain.set(token.chain, existing);
  }

  for (const [destinationChain, destinationTokens] of tokensByDestinationChain) {
    const groupKey = `${destinationChain}|${sourceChain}`;
    const group = groups.get(groupKey) ?? {
      destinationChain,
      sourceChain,
      contributions: [],
    };
    group.contributions.push({ bridgeName, pegType, tokens: destinationTokens });
    groups.set(groupKey, group);
  }
}

function applyDestinationGroup(
  adapter: PeggedIssuanceAdapter,
  group: DestinationGroup
) {
  const { destinationChain, sourceChain, contributions } = group;
  adapter[destinationChain] = adapter[destinationChain] ?? {};

  if (adapter[destinationChain][sourceChain]) {
    logManualCollisionSkip(destinationChain, sourceChain, contributions);
    return;
  }

  if (adapter[destinationChain].minted) {
    logNativeMintedSkip(destinationChain, sourceChain, contributions);
    return;
  }

  const dedupedContributions = dedupeContributionsByAddress(contributions);
  if (dedupedContributions.length === 0) return;

  adapter[destinationChain][sourceChain] = buildBridgeFetcher(
    destinationChain,
    sourceChain,
    dedupedContributions
  );
}

function dedupeContributionsByAddress(
  contributions: BridgeContribution[]
): BridgeContribution[] {
  // Dedup by ERC20 address only: distinct addresses across bridges are kept
  // and summed; same address listed in multiple bridges (XERC20 / canonical
  // multi-bridge tokens) is counted once, attributed to the first-enrolled
  // bridge to avoid double-counting `totalSupply()`.
  const seenAddresses = new Set<string>();
  const deduped: BridgeContribution[] = [];

  for (const contribution of contributions) {
    const uniqueTokens: BridgeToken[] = [];
    for (const token of contribution.tokens) {
      const normalizedAddress = token.address.toLowerCase();
      if (seenAddresses.has(normalizedAddress)) continue;
      seenAddresses.add(normalizedAddress);
      uniqueTokens.push(token);
    }
    if (uniqueTokens.length > 0) {
      deduped.push({ ...contribution, tokens: uniqueTokens });
    }
  }

  return deduped;
}

function logManualCollisionSkip(
  destinationChain: string,
  sourceChain: string,
  contributions: BridgeContribution[]
) {
  const bridgeNames = [...new Set(contributions.map((c) => c.bridgeName))].join("+");
  const tokenCount = contributions.reduce((total, c) => total + c.tokens.length, 0);
  console.log(
    `[bridgeConfig] skipping ${bridgeNames} entry for ${destinationChain}.${sourceChain} (${tokenCount} token${tokenCount === 1 ? "" : "s"}); manual entry exists`
  );
}

function logNativeMintedSkip(
  destinationChain: string,
  sourceChain: string,
  contributions: BridgeContribution[]
) {
  // Native minted on this chain: treating these as bridged-from-source would
  // double-count the chain's own circulating AND negatively subtract from the
  // source chain's circulating.
  const tokenCount = contributions.reduce(
    (total, contribution) => total + contribution.tokens.length,
    0
  );
  console.log(
    `[bridgeConfig] skipping ${destinationChain}.${sourceChain} (${tokenCount} token${tokenCount === 1 ? "" : "s"}); chain already has native minted`
  );
}

function buildBridgeFetcher(
  destinationChain: string,
  sourceChain: string,
  contributions: BridgeContribution[]
) {
  const isSingleBridgeSingleToken =
    contributions.length === 1 && contributions[0].tokens.length === 1;

  if (isSingleBridgeSingleToken) {
    const contribution = contributions[0];
    const token = contribution.tokens[0];
    return bridgedSupply(
      destinationChain,
      token.decimals,
      [token.address],
      contribution.bridgeName,
      sourceChain,
      contribution.pegType as PeggedAssetType | undefined
    );
  }

  return async function fetchComposedBridgedSupply(_api: ChainApi) {
    const api = await getApi(destinationChain, _api);
    const balances: Balances = {} as Balances;

    for (const contribution of contributions) {
      const pegType = (contribution.pegType ?? "peggedUSD") as PeggedAssetType;
      const addresses = contribution.tokens.map((token) => token.address);
      const supplies = await api.multiCall({
        abi: "erc20:totalSupply",
        calls: addresses,
      });

      for (let i = 0; i < supplies.length; i++) {
        sumSingleBalance(
          balances,
          pegType,
          supplies[i] / 10 ** contribution.tokens[i].decimals,
          contribution.bridgeName,
          false,
          sourceChain
        );
      }
    }

    return balances;
  };
}
