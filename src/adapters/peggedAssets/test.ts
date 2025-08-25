process.env.SKIP_RPC_CHECK = 'true'

require("dotenv").config();
const path = require("path");
import * as sdk from "@defillama/sdk";
import peggedAssets from "../../peggedData/peggedData";
import { PeggedAssetIssuance, PeggedTokenBalance } from "../../types";
import { extractIssuanceFromSnapshot, getClosestSnapshotForChain } from "../../utils/extrapolatedCacheFallback";
import { PeggedIssuanceAdapter } from "./peggedAsset.type";
const {
  humanizeNumber,
} = require("@defillama/sdk/build/computeTVL/humanizeNumber");
const chainList = require("./helper/chains.json");
const errorString = "------ ERROR ------";

type ChainBlocks = {
  [chain: string]: number;
};

type BridgeMapping = {
  [chain: string]: PeggedTokenBalance[];
};

const pegTypes = ["peggedUSD", "peggedEUR", "peggedVAR"];

async function getPeggedAsset(
  _unixTimestamp: number,
  ethBlock: number,
  chainBlocks: ChainBlocks,
  peggedBalances: PeggedAssetIssuance,
  chain: string,
  issuanceType: string,
  issuanceFunction: any,
  pegType: string,
  bridgedFromMapping: BridgeMapping = {},
  extrapolationMetadata: { extrapolated: boolean; extrapolatedChains: Array<{ chain: string; timestamp: number }> },
  stablecoinId: string,
  adapterLabel: string
) {
  const maxRetries = 3;
  const timeoutMs = 3 * 60 * 1000; // 3 minutes
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const chainApi = new sdk.ChainApi({ chain })
      const balance = await Promise.race([
        issuanceFunction(
          chainApi,
          ethBlock,
          chainBlocks
        ) as Promise<PeggedTokenBalance>,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Issuance function for chain ${chain} exceeded the timeout limit`)), timeoutMs)
        ),
      ]);
      
      if (balance && Object.keys(balance).length === 0) {
        peggedBalances[chain] = peggedBalances[chain] || {};
        peggedBalances[chain][issuanceType] = { [pegType]: 0 };
        return balance;
      }
      
      if (!balance) {
        throw new Error(`Could not get pegged balance on chain ${chain}`);
      }
      
      if (typeof (balance as any)[pegType] !== "number" || Number.isNaN((balance as any)[pegType])) {
        throw new Error(
          `Pegged balance on chain ${chain} is not a number, instead it is ${(balance as any)[pegType]}. Make sure balance object is exported with key from: ${pegType}.`
        );
      }
      
      const bridges = (balance as any).bridges;
      if (!bridges && issuanceType !== "minted" && issuanceType !== "unreleased") {
        console.error(
          `${errorString}
          Bridge data not found on chain ${chain}. Use sumSingleBalance from helper/generalUtil to add bridge data.`
        );
      }
      
      peggedBalances[chain] = peggedBalances[chain] || {};
      peggedBalances[chain][issuanceType] = balance as PeggedTokenBalance;
      
      if (issuanceType !== "minted" && issuanceType !== "unreleased") {
        bridgedFromMapping[issuanceType] = bridgedFromMapping[issuanceType] || [];
        bridgedFromMapping[issuanceType].push(balance as PeggedTokenBalance);
      }
      
      return balance as PeggedTokenBalance;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (i >= maxRetries - 1) {
        console.warn(`[${adapterLabel}] Chain ${chain} failed after ${maxRetries} attempts:`, errorMessage);
        console.log(`[${adapterLabel}] Using snapshot fallback for failed chain ${chain}`);

        try {
          const snap = await getClosestSnapshotForChain(
            stablecoinId,
            chain,
            _unixTimestamp,
          );

          if (snap && snap.snapshot && typeof snap.snapshot === 'object') {
            const { snapshot, timestamp } = snap;

            const extracted = extractIssuanceFromSnapshot(snapshot, issuanceType, pegType, chain);

            peggedBalances[chain] = peggedBalances[chain] || {};
            if (extracted) {
              peggedBalances[chain][issuanceType] = extracted;

              if (issuanceType !== "minted" && issuanceType !== "unreleased" && issuanceType !== "circulating") {
                bridgedFromMapping[issuanceType] = bridgedFromMapping[issuanceType] || [];
                bridgedFromMapping[issuanceType].push(extracted);
              }
            } else {
              peggedBalances[chain][issuanceType] = { [pegType]: null as any };
              console.log(
                `[${adapterLabel}] Snapshot found but issuance '${issuanceType}' not present in bridgedTo for ${chain}`
              );
            }

            extrapolationMetadata.extrapolated = true;
            if (!extrapolationMetadata.extrapolatedChains.find(ec => ec.chain === chain)) {
              extrapolationMetadata.extrapolatedChains.push({ chain, timestamp });
            }

            return peggedBalances[chain][issuanceType] || null;
          }

          console.log(`[${adapterLabel}] No cached snapshot found for chain ${chain} (issuance: ${issuanceType})`);
          peggedBalances[chain] = peggedBalances[chain] || {};
          peggedBalances[chain][issuanceType] = { [pegType]: null as any };
          
          console.error(`Getting ${issuanceType} on chain ${chain} failed.`);
          return null;
        } catch (cacheError) {
          console.error(`[${adapterLabel}] Cache fallback also failed for chain ${chain}:`, cacheError);
          peggedBalances[chain] = peggedBalances[chain] || {};
          peggedBalances[chain][issuanceType] = { [pegType]: null as any };
          return null;
        }
      } else {
        console.warn(`[${adapterLabel}] Chain ${chain} attempt ${i + 1}/${maxRetries} failed:`, errorMessage);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 1s, 2s, 3s
        continue;
      }
    }
  }
}

async function calcCirculating(
  peggedBalances: PeggedAssetIssuance,
  bridgedFromMapping: BridgeMapping,
  pegType: string
) {
  let chainCirculatingPromises = Object.keys(peggedBalances).map(
    async (chain) => {
      let circulating: PeggedTokenBalance = { [pegType]: 0 };
      const chainIssuances = peggedBalances[chain];
      
      Object.entries(chainIssuances).map(
        ([issuanceType, peggedTokenBalance]) => {
          const balance = (peggedTokenBalance as any)[pegType];
          if (balance == null) {
            return;
          }
          if (issuanceType === "unreleased") {
            circulating[pegType] = circulating[pegType] || 0;
            circulating[pegType]! -= balance;
          } else {
            circulating[pegType]! = circulating[pegType] || 0;
            circulating[pegType]! += balance;
          }
        }
      );
      
      if (bridgedFromMapping[chain]) {
        bridgedFromMapping[chain].forEach((peggedTokenBalance) => {
          const balance = peggedTokenBalance[pegType];
          if (balance == null || circulating[pegType] === 0) {
            console.error(`Null balance or 0 circulating on chain ${chain}`);
            return;
          }
          circulating[pegType]! -= balance;
        });
      }
      
      if (circulating[pegType]! < 0) {
        throw new Error(
          `Pegged asset on chain ${chain} has negative circulating amount`
        );
      }
      (peggedBalances as any)[chain].circulating = circulating;
    }
  );
  await Promise.all(chainCirculatingPromises);

  peggedBalances["totalCirculating"] = {};
  peggedBalances["totalCirculating"]["circulating"] = { [pegType]: 0 };
  peggedBalances["totalCirculating"]["unreleased"] = { [pegType]: 0 };
  let peggedTotalPromises = Object.keys(peggedBalances).map((chain) => {
    const circulating = (peggedBalances as any)[chain].circulating || { [pegType]: 0 };
    const unreleased  = (peggedBalances as any)[chain].unreleased  || { [pegType]: 0 };
    if (chain !== "totalCirculating") {
      (peggedBalances as any)["totalCirculating"]["circulating"][pegType]! +=
        circulating[pegType] || 0;
      (peggedBalances as any)["totalCirculating"]["unreleased"][pegType]! +=
        unreleased[pegType] || 0;
    }
  });
  await Promise.all(peggedTotalPromises);
}

if (process.argv.length < 3) {
  console.error(`Missing argument, you need to provide the filename of the adapter to test and the pegType.
      Eg: npx ts-node test projects/myadapter/index peggedUSD`);
  process.exit(1);
}

const passedFile = path.resolve(process.cwd(), process.argv[2]);
const dummyFn = () => {};
const INTERNAL_CACHE_FILE = 'pegged-assets-cache/sdk-cache.json';

function getStablecoinIdFromPath(filePath: string): string {
  const pathParts = filePath.split(path.sep);
  const stablecoinDir = pathParts[pathParts.length - 1];
  
  if (/^\d+$/.test(stablecoinDir)) {
    return stablecoinDir;
  }
  
  const peggedAsset = peggedAssets.find((pegged) => {
    return pegged.gecko_id === stablecoinDir;
  });
  
  if (peggedAsset) {
    return peggedAsset.id;
  }
  
  console.warn(`[WARNING] Could not determine stablecoin ID for path: ${filePath}, using folder name: ${stablecoinDir}`);
  return stablecoinDir;
}

function getAdapterLabelFromPath(filePath: string): string {
  const parts = filePath.split(path.sep);
  const last = parts[parts.length - 1] || 'unknown-adapter';
  if (/^\d+$/.test(last)) {
    const found = peggedAssets.find(p => p.id === last);
    return (found?.gecko_id || found?.name || last) as string;
  }
  return last;
}

(async () => {
  let adapter = {} as PeggedIssuanceAdapter;
  try {
    adapter = require(passedFile);
  } catch (e) {
    console.log(e);
  }
  const module = adapter.default;
  const chains = Object.keys(module).filter(
    (chain) => !["minted", "unreleased"].includes(chain)
  );

  const stablecoinId = getStablecoinIdFromPath(passedFile);
  const adapterLabel = getAdapterLabelFromPath(passedFile);
  console.log(`[INFO] Detected stablecoin: ${adapterLabel} (id: ${stablecoinId}) for file: ${passedFile}`);

  checkExportKeys(passedFile, chains);
  const unixTimestamp = Math.round(Date.now() / 1000) - 60;
  const chainBlocks = {} as ChainBlocks;

  if (!chains.includes("ethereum")) {
    chains.push("ethereum");
  }
  
  const ethBlock = chainBlocks.ethereum;

  let pegType = process.argv[3];
  if (pegType === undefined) {
    pegType = "peggedUSD";
  }
  let peggedBalances: PeggedAssetIssuance = {};
  let bridgedFromMapping: BridgeMapping = {};
  
  const extrapolationMetadata = {
    extrapolated: false,
    extrapolatedChains: [] as Array<{ chain: string; timestamp: number }>
  };

  await initializeSdkInternalCache()

  let peggedBalancesPromises = Object.entries(module).map(
    async ([chain, issuances]) => {
      if (typeof issuances !== "object" || issuances === null) {
        return;
      }
      const issuanceTypes = Object.keys(issuances);

      if (issuanceTypes.includes(chain)) {
        throw new Error(`Chain ${chain} has issuance bridged to itself.`);
      }
      let peggedChainPromises = Object.entries(issuances).map(
        async ([issuanceType, issuanceFunctionPromise]) => {
          try {
            const issuanceFunction = await issuanceFunctionPromise;
            if (typeof issuanceFunction !== "function") {
              return;
            }
            await getPeggedAsset(
              unixTimestamp,
              ethBlock,
              chainBlocks,
              peggedBalances,
              chain,
              issuanceType,
              issuanceFunction,
              pegType,
              bridgedFromMapping,
              extrapolationMetadata,
              stablecoinId,
              adapterLabel
            );
          } catch (e) {
            console.log(`Failed on ${chain}:${issuanceType}`, e);
          }
        }
      );
      await Promise.all(peggedChainPromises);
    }
  );
  await Promise.all(peggedBalancesPromises);
  
  await Promise.race([
    calcCirculating(peggedBalances, bridgedFromMapping, pegType),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('calcCirculating exceeded the timeout limit')), 3 * 60 * 1000)
    ),
  ]);
  if (
    typeof (peggedBalances as any).totalCirculating.circulating[pegType] !== "number"
  ) {
    throw new Error(`Pegged asset doesn't have total circulating`);
  }
  if ((peggedBalances as any).totalCirculating.circulating[pegType]! > 1000e9) {
    throw new Error(`Pegged asset total circulating is over 1000 billion`);
  }
  if ((peggedBalances as any).totalCirculating.circulating[pegType] === 0) {
    throw new Error(`Returned 0 total circulating`);
  }
  const displayTable: any = []
  Object.entries(peggedBalances).forEach(([chain, issuances]) => {
    if (chain === "extrapolated" || chain === "extrapolatedChains") {
      return;
    }
    
    const item: any = { chain}
    if (chain !== "totalCirculating") {
      displayTable.push(item)
      console.log(`--- ${chain} ---`);
      
      if (issuances && typeof issuances === 'object') {
        Object.entries(issuances)
          .filter(([_, issuance]) => issuance && typeof issuance === 'object')
          .sort((a, b) => {
            const aValue = (a[1] as any)?.[pegType] ?? 0;
            const bValue = (b[1] as any)?.[pegType] ?? 0;
            return bValue - aValue;
          })
          .forEach(([issuanceType, issuance]) => {
            const value = (issuance as any)?.[pegType];
            item[issuanceType] = safeHumanizeNumber(value);
            console.log(
              issuanceType.padEnd(25, " "),
              safeHumanizeNumber(value)
            );
          });
      } else {
        console.log(`[DEBUG] Chain ${chain} has invalid issuances data:`, issuances);
      }
    }
  });
  console.log(`------ Total Circulating ------`);
  const totalItem: any = { chain: "Total Circulating" }
  Object.entries((peggedBalances as any).totalCirculating).forEach(
    ([issuanceType, issuance]) =>{
      totalItem[issuanceType] = humanizeNumber((issuance as any)[pegType]);
      console.log(
        `Total ${issuanceType}`.padEnd(25, " "),
        humanizeNumber((issuance as any)[pegType])
      )
    }
  );
  
  if (extrapolationMetadata.extrapolated) {
    console.log(`\n------ EXTRAPOLATION INFO ------`);
    console.log(`⚠️  Some chains used extrapolated data from cache`);
    console.log(`Extrapolated chains details:`);
    
    extrapolationMetadata.extrapolatedChains?.forEach((extrapolatedChain: any) => {
      const d = new Date(extrapolatedChain.timestamp * 1000);
      const formattedDate = d.toISOString().slice(0, 10); // YYYY-MM-DD
      console.log(`   • ${extrapolatedChain.chain}: ${formattedDate}`);
    });
  } else {
    console.log(`\n------ NO EXTRAPOLATION ------`);
    console.log(`✅ All chains used real-time data`);
  }
  
  console.log(`\n[DEBUG] Final extrapolation state:`, {
    extrapolated: extrapolationMetadata.extrapolated,
    extrapolatedChainsCount: extrapolationMetadata.extrapolatedChains?.length || 0,
    extrapolationMetadata: extrapolationMetadata.extrapolatedChains
  });
  displayTable.push(totalItem)
  console.table(displayTable);
  process.exit(0);
})();

function checkExportKeys(_filePath: string, chains: string[]) {

  const unknownChains = chains.filter((chain) => !chainList.includes(chain));

  if (unknownChains.length) {
    console.log(`
      ${errorString}
  
      Unknown chain(s): ${unknownChains.join(", ")}
      Note: if you think that the chain is correct but missing from our list, please add it to 'projects/helper/chains.json' file
      `);
    process.exit(1);
  }
}

function handleError(error: string) {
  console.log("\n", errorString, "\n\n");
  console.error(error);
  process.exit(1);
}

process.on("unhandledRejection", handleError);
process.on("uncaughtException", handleError);

async function initializeSdkInternalCache() {
  let currentCache = await sdk.cache.readCache(INTERNAL_CACHE_FILE)
  const ONE_MONTH = 60 * 60 * 24 * 30
  if (!currentCache || !currentCache.startTime || (Date.now() / 1000 - currentCache.startTime > ONE_MONTH)) {
    currentCache = {
      startTime: Math.round(Date.now() / 1000),
    }
    await sdk.cache.writeCache(INTERNAL_CACHE_FILE, currentCache)
  }
  sdk.sdkCache.startCache(currentCache)
}

async function saveSdkInternalCache() {
  await sdk.cache.writeCache(INTERNAL_CACHE_FILE, sdk.sdkCache.retriveCache())
}

function safeHumanizeNumber(value: any): string {
  if (value === null || value === undefined) {
    return "0";
  }
  if (typeof value === "number") {
    return humanizeNumber(value);
  }
  if (typeof value === "string") {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "0";
    }
    return humanizeNumber(numValue);
  }
  return "0";
}
