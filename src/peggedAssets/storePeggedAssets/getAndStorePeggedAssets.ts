import * as sdk from "@defillama/sdk";
import { PeggedAsset } from "../../peggedData/peggedData";
import {
  BridgeBalances,
  PeggedAssetIssuance,
  PeggedTokenBalance,
} from "../../types";
import { getCurrentUnixTimestamp } from "../../utils/date";
import { extractIssuanceFromSnapshot, getClosestSnapshotForChain } from "../../utils/extrapolatedCacheFallback";
import {
  dailyPeggedBalances,
  hourlyPeggedBalances,
} from "../utils/getLastRecord";
import { executeAndIgnoreErrors } from "./errorDb";
import storeNewPeggedBalances from "./storeNewPeggedBalances";

type ChainBlocks = {
  [chain: string]: number;
};

type BridgeMapping = {
  [chain: string]: PeggedTokenBalance[];
};

type EmptyObject = { [key: string]: undefined };

function detectPegKey(balance: any, wanted: string) {
  if (balance && typeof balance === 'object') {
    if (wanted in balance && typeof balance[wanted] === 'number' && !Number.isNaN(balance[wanted]))
      return wanted;
    const found = Object.keys(balance).find(k => k.startsWith('pegged') && typeof balance[k] === 'number' && !Number.isNaN(balance[k]));
    if (found) return found;
  }
  return wanted;
}

async function getPeggedAsset(
  api: sdk.ChainApi,
  ethBlock: number | undefined,
  chainBlocks: ChainBlocks | undefined,
  peggedAsset: PeggedAsset,
  peggedBalances: PeggedAssetIssuance,
  chain: string,
  issuanceType: string,
  issuanceFunction: any,
  pegType: string,
  bridgedFromMapping: BridgeMapping = {},
  maxRetries: number,
  extrapolationMetadata?: { extrapolated: boolean; extrapolatedChains: Array<{ chain: string; timestamp: number }> }
) {
  const timeoutMs = 3 * 60 * 1000; // 3 minutes
  const label = (issuanceType === 'minted' || issuanceType === 'unreleased' || issuanceType === 'circulating')
    ? issuanceType
    : `bridgedFrom ${issuanceType} → ${chain}`;
  const tag = `[${peggedAsset.name}|id=${peggedAsset.id}]`;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      peggedBalances[chain] = peggedBalances[chain] || {};
      
      const balance = await Promise.race([
        issuanceFunction(api, ethBlock, chainBlocks) as Promise<PeggedTokenBalance>,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Issuance function for chain ${chain} exceeded the timeout limit`)), timeoutMs)
        ),
      ]);
      
      if (balance && Object.keys(balance).length === 0) {
        peggedBalances[chain][issuanceType] = { [pegType]: 0 };
        return;
      }
      if (!balance) {
        throw new Error(
          `Could not get pegged balance for ${peggedAsset.name} on chain ${chain}`
        );
      }

      const pegKey = detectPegKey(balance, pegType);
      if (
        typeof balance[pegKey] !== "number" ||
        Number.isNaN(balance[pegKey])
      ) {
        throw new Error(
          `Pegged balance for ${peggedAsset.name} is not a number, instead it is ${balance[pegKey]}`
        );
      }
      if (pegKey !== pegType) {
        (balance as any)[pegType] = (balance as any)[pegKey];
      }

      peggedBalances[chain][issuanceType] = balance;
      if (issuanceType !== "minted" && issuanceType !== "unreleased") {
        // IMPORTANT: index by SOURCE chain (issuanceType)
        bridgedFromMapping[issuanceType] =
          bridgedFromMapping[issuanceType] || [];
        bridgedFromMapping[issuanceType].push(balance);
      }
      return;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      
      if (i >= maxRetries - 1) {
        console.warn(`${tag} Chain ${chain} failed after ${maxRetries} attempts (${label}):`, errorMessage);
        console.log(`${tag} Using snapshot fallback for chain ${chain} (${label})`);

        try {
          const snap = await getClosestSnapshotForChain(
            peggedAsset.id,
            chain,
            getCurrentUnixTimestamp(),
          );

          if (snap && snap.snapshot && typeof snap.snapshot === 'object') {
            const { snapshot, timestamp } = snap;

            const extracted = extractIssuanceFromSnapshot(snapshot, issuanceType, pegType, chain);

            peggedBalances[chain] = peggedBalances[chain] || {};
            if (extracted) {
              peggedBalances[chain][issuanceType] = extracted as any;

              if (issuanceType !== "minted" && issuanceType !== "unreleased" && issuanceType !== "circulating") {
                bridgedFromMapping[issuanceType] = bridgedFromMapping[issuanceType] || [];
                bridgedFromMapping[issuanceType].push(extracted as any);
              }
              
              console.log(`✅ ${tag} Cache fallback successful for ${chain} (${label})`);
              
              if (extrapolationMetadata) {
                extrapolationMetadata.extrapolated = true;
                if (!extrapolationMetadata.extrapolatedChains.find(ec => ec.chain === chain)) {
                  extrapolationMetadata.extrapolatedChains.push({ 
                    chain, 
                    timestamp: timestamp 
                  });
                }
              }
              
              return;
            } else {
              console.warn(`${tag} No data extracted from snapshot for chain ${chain} (${label})`);
            }
          } else {
            console.warn(`${tag} No cached snapshot found for chain ${chain} (${label})`);
          }
        } catch (cacheError) {
          console.error(`${tag} Cache fallback failed for ${peggedAsset.name} on chain ${chain} (${label}):`, cacheError);
        }
        
        executeAndIgnoreErrors("INSERT INTO `errors2` VALUES (?, ?, ?, ?)", [
          getCurrentUnixTimestamp(),
          peggedAsset.gecko_id,
          chain,
          String(e),
        ]);
        peggedBalances[chain][issuanceType] = { [pegType]: null };
      } else {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
}

function mergeBridges(
  bridgeBalances: BridgeBalances | EmptyObject,
  bridgeBalancesToMerge: BridgeBalances
) {
  if (bridgeBalances && Object.keys(bridgeBalances).length === 0) {
    return bridgeBalancesToMerge;
  }
  bridgeBalances = bridgeBalances as BridgeBalances;
  for (let bridgeID in bridgeBalancesToMerge) {
    for (let sourceChain in bridgeBalancesToMerge[bridgeID]) {
      if (bridgeBalances?.[bridgeID]?.[sourceChain]) {
        const bridgeBalance = bridgeBalances[bridgeID][sourceChain].amount ?? 0;
        const bridgeBalanceToMerge =
          bridgeBalancesToMerge[bridgeID][sourceChain].amount;
        if (
          typeof bridgeBalance === "number" &&
          typeof bridgeBalanceToMerge === "number"
        ) {
          bridgeBalances[bridgeID][sourceChain].amount =
            bridgeBalance + bridgeBalanceToMerge;
        } else {
          bridgeBalances[bridgeID][sourceChain].amount = Number(BigInt(bridgeBalance ?? 0) + BigInt(bridgeBalanceToMerge ?? 0));
        }
      } else {
        bridgeBalances[bridgeID] = bridgeBalances[bridgeID] || {};
        bridgeBalances[bridgeID][sourceChain] =
          bridgeBalancesToMerge[bridgeID][sourceChain];
      }
    }
  }
  return bridgeBalances;
}

async function calcCirculating(
  peggedBalances: PeggedAssetIssuance,
  bridgedFromMapping: BridgeMapping,
  peggedAsset: PeggedAsset,
  pegType: string,
  extrapolationMetadata?: { extrapolated: boolean; extrapolatedChains: Array<{ chain: string; timestamp: number }> }
) {
  let chainCirculatingPromises = Object.keys(peggedBalances).map(
    async (chain) => {
      let circulating: PeggedTokenBalance = { [pegType]: 0 };
      peggedBalances[chain].bridgedTo = {};
      peggedBalances[chain].bridgedTo[pegType] = 0;
      const chainIssuances = peggedBalances[chain];
      Object.entries(chainIssuances).map(
        ([issuanceType, peggedTokenBalance]) => {
          const balance = peggedTokenBalance[pegType];
          const bridges = JSON.parse(
            JSON.stringify(peggedTokenBalance.bridges ?? {})
          );
          if (balance == null) {
            return;
          }
          if (issuanceType === "unreleased") {
            circulating[pegType] = circulating[pegType] || 0;
            circulating[pegType]! -= balance;
          } else {
            if (issuanceType !== "bridgedTo") {
              if (issuanceType !== "minted" && issuanceType !== "circulating") {
                peggedBalances[chain].bridgedTo[pegType]! += balance;
                if (bridges) {
                  peggedBalances[chain].bridgedTo.bridges = mergeBridges(
                    peggedBalances[chain].bridgedTo.bridges || {},
                    bridges
                  );
                }
              }
              circulating[pegType] = circulating[pegType] || 0;
              circulating[pegType]! += balance;
              delete peggedTokenBalance.bridges;
            }
          }
        }
      );
      if (bridgedFromMapping[chain]) {
        bridgedFromMapping[chain].forEach((peggedTokenBalance) => {
          const balance = peggedTokenBalance[pegType];
          if (balance == null || circulating[pegType] === 0) {
            console.error(
              `Null balance or 0 circulating error on chain ${chain}`
            );
            executeAndIgnoreErrors(
              "INSERT INTO `errors2` VALUES (?, ?, ?, ?)",
              [
                getCurrentUnixTimestamp(),
                peggedAsset.gecko_id,
                chain,
                `Null balance or 0 circulating error`,
              ]
            );
            return;
          }
          circulating[pegType]! -= balance;
        });
      }
      if (circulating[pegType]! < 0) {
        try {
          const snap = await getClosestSnapshotForChain(
            peggedAsset.id,
            chain,
            getCurrentUnixTimestamp(),
          );
          if (snap && snap.snapshot) {
            const extractedCirc = extractIssuanceFromSnapshot(snap.snapshot, 'circulating', pegType, chain);
            const val = extractedCirc?.[pegType];
            if (typeof val === 'number' && Number.isFinite(val) && val >= 0) {
              peggedBalances[chain].circulating = { [pegType]: val };
              if (extrapolationMetadata) {
                extrapolationMetadata.extrapolated = true;
                if (!extrapolationMetadata.extrapolatedChains.find(ec => ec.chain === chain)) {
                  extrapolationMetadata.extrapolatedChains.push({ chain, timestamp: snap.timestamp || 0 });
                }
              }
              return;
            }
          }
        } catch (_) {}
        executeAndIgnoreErrors("INSERT INTO `errors2` VALUES (?, ?, ?, ?)", [
          getCurrentUnixTimestamp(),
          peggedAsset.gecko_id,
          chain,
          `Pegged asset has negative circulating amount`,
        ]);
        throw new Error(
          `Pegged asset on chain ${chain} has negative circulating amount`
        );
      }
      if (circulating[pegType]! < 10 ** -6) {
        circulating[pegType] = 0;
      }
      peggedBalances[chain].circulating = circulating;
    }
  );
  await Promise.all(chainCirculatingPromises);

  peggedBalances["totalCirculating"] = {};
  peggedBalances["totalCirculating"]["circulating"] = { [pegType]: 0 };
  peggedBalances["totalCirculating"]["unreleased"] = { [pegType]: 0 };
  let peggedTotalPromises = Object.keys(peggedBalances).map((chain) => {
    const circulating = peggedBalances[chain].circulating;
    const unreleased = peggedBalances[chain].unreleased;
    if (chain !== "totalCirculating") {
      peggedBalances["totalCirculating"]["circulating"][pegType]! +=
        circulating[pegType] || 0;
      peggedBalances["totalCirculating"]["unreleased"][pegType]! +=
        unreleased[pegType] || 0;
    }
  });
  await Promise.all(peggedTotalPromises);
}

const timeout = (prom: any, time: number, peggedID: string, chain: string) =>
  Promise.race([prom, new Promise((_r, rej) => setTimeout(rej, time))]).catch(
    async (err) => {
      console.error(
        `Could not store peggedAsset ${peggedID} on chain ${chain}`,
        err
      );
      throw err;
    }
  );

export async function storePeggedAsset(
  unixTimestamp: number,
  ethBlock: number | undefined,
  chainBlocks: ChainBlocks | undefined,
  peggedAsset: PeggedAsset,
  module: any,
  maxRetries: number = 1,
  breakIfIssuanceIsZero: boolean = false
) {
  const pegType = peggedAsset.pegType;
  let peggedBalances: PeggedAssetIssuance = {};
  let bridgedFromMapping: BridgeMapping = {};
  
  const extrapolationMetadata = {
    extrapolated: false,
    extrapolatedChains: [] as Array<{ chain: string; timestamp: number }>
  };
  
  try {
    let peggedBalancesPromises = Object.entries(module).map(
      async ([chain, issuances]) => {
        if (typeof issuances !== "object" || issuances === null) {
          return;
        }
        let peggedChainPromises = Object.entries(issuances).map(
          async ([issuanceType, issuanceFunctionPromise]) => {
            const issuanceFunction = await issuanceFunctionPromise;
            if (typeof issuanceFunction !== "function") {
              return;
            }
            const api = new sdk.ChainApi({ 
              chain: (issuanceType === 'minted' || issuanceType === 'unreleased') ? chain : issuanceType, 
              timestamp: unixTimestamp 
            });
            await getPeggedAsset(
              api,
              ethBlock,
              chainBlocks,
              peggedAsset,
              peggedBalances,
              chain,
              issuanceType,
              issuanceFunction,
              pegType,
              bridgedFromMapping,
              maxRetries,
              extrapolationMetadata
            );
          }
        );
        await timeout(
          Promise.all(peggedChainPromises),
          3 * 60 * 1000, // 3 minutes
          peggedAsset.name,
          chain
        );
      }
    );
    await Promise.all(peggedBalancesPromises);
    await calcCirculating(
      peggedBalances,
      bridgedFromMapping,
      peggedAsset,
      pegType,
      extrapolationMetadata
    );

    if (
      typeof peggedBalances.totalCirculating.circulating[pegType] !== "number"
    ) {
      throw new Error(`Pegged asset doesn't have total circulating`);
    }
    if (peggedBalances.totalCirculating.circulating[pegType]! > 100e10) {
      throw new Error(`Pegged asset total circulating is over 1 trillion`);
    }
  } catch (e) {
    console.error(peggedAsset.name, e);
    return;
  }
  if (
    breakIfIssuanceIsZero &&
    peggedBalances.totalCirculating.circulating[pegType] === 0
  ) {
    throw new Error(
      `Returned 0 total circulating at timestamp ${unixTimestamp}`
    );
  }

  if (extrapolationMetadata.extrapolated) {
    (peggedBalances as any).extrapolated = extrapolationMetadata.extrapolated;
    (peggedBalances as any).extrapolatedChains = extrapolationMetadata.extrapolatedChains;
    (peggedBalances as any).extrapolatedChainsCount = extrapolationMetadata.extrapolatedChains?.length || 0;
  }

  try {
    const storeTokensAction = storeNewPeggedBalances(
      peggedAsset,
      unixTimestamp,
      peggedBalances,
      hourlyPeggedBalances,
      dailyPeggedBalances,
      extrapolationMetadata
    );
    await storeTokensAction;
  } catch (e) {
    console.error(peggedAsset.name, e);
    return;
  }

  if (extrapolationMetadata.extrapolated) {
    console.log(`[${peggedAsset.name}|id=${peggedAsset.id}] ⚠️  Used cache fallback for some chains:`, extrapolationMetadata.extrapolatedChains.map(ec => ec.chain).join(', '));
  }

  return peggedBalances;
}
