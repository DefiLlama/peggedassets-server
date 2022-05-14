import { PeggedAsset } from "../../peggedData/peggedData";
import * as Sentry from "@sentry/serverless";
import { PeggedAssetIssuance, PeggedTokenBalance } from "../../types";
import {
  hourlyPeggedBalances,
  dailyPeggedBalances,
} from "../utils/getLastRecord";
import storeNewPeggedBalances from "./storeNewPeggedBalances";

type ChainBlocks = {
  [chain: string]: number;
};

type BridgeMapping = {
  [chain: string]: PeggedTokenBalance[];
};

async function getPeggedAsset(
  unixTimestamp: number,
  ethBlock: number,
  chainBlocks: ChainBlocks,
  peggedAsset: PeggedAsset,
  peggedBalances: PeggedAssetIssuance,
  chain: string,
  issuanceType: string,
  issuanceFunction: any,
  pegType: string,
  bridgedFromMapping: BridgeMapping = {},
  maxRetries: number
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      peggedBalances[chain] = peggedBalances[chain] || {};
      const balance = (await issuanceFunction(
        unixTimestamp,
        ethBlock,
        chainBlocks
      )) as PeggedTokenBalance;
      if (balance && Object.keys(balance).length === 0) {
        peggedBalances[chain][issuanceType] = { [pegType]: 0 };
        return;
      }
      if (!balance) {
        throw new Error(
          `Could not get pegged balance for ${peggedAsset.name} on chain ${chain}`
        );
      }
      if (
        typeof balance[pegType] !== "number" ||
        Number.isNaN(balance[pegType])
      ) {
        throw new Error(
          `Pegged balance for ${peggedAsset.name} is not a number, instead it is ${balance[pegType]}`
        );
      }
      peggedBalances[chain][issuanceType] = balance;
      if (issuanceType !== "minted" && issuanceType !== "unreleased") {
        // issuanceType must be a chain within peggedBalances, but I check for that when testing adapters.
        bridgedFromMapping[issuanceType] =
          bridgedFromMapping[issuanceType] || [];
        bridgedFromMapping[issuanceType].push(balance);
      }
      return;
    } catch (e) {
      if (i >= maxRetries - 1) {
        console.error(
          `Getting circulating for ${peggedAsset.name} on chain ${chain} failed.`,
          e
        );
        peggedBalances[chain][issuanceType] = { [pegType]: null };
      } else {
        console.error(peggedAsset.name, e);
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
      peggedBalances[chain].bridgedTo = {};
      peggedBalances[chain].bridgedTo[pegType] = 0;
      const chainIssuances = peggedBalances[chain];
      Object.entries(chainIssuances).map(
        ([issuanceType, peggedTokenBalance]) => {
          const balance = peggedTokenBalance[pegType];
          if (balance == null) {
            return;
          }
          if (issuanceType === "unreleased") {
            circulating[pegType] = circulating[pegType] || 0;
            circulating[pegType]! -= balance;
          } else {
            if (issuanceType !== "bridgedTo") {
              if (issuanceType !== "minted" && issuanceType !== "circulating") {
                peggedBalances[chain].bridgedTo[pegType]! += // issuanceType is a chain here
                  balance;
              }
              circulating[pegType] = circulating[pegType] || 0;
              circulating[pegType]! += balance; // issuanceType is either "minted" or a chain here
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

export async function storePeggedAsset(
  unixTimestamp: number,
  ethBlock: number,
  chainBlocks: ChainBlocks,
  peggedAsset: PeggedAsset,
  module: any,
  maxRetries: number = 1,
  breakIfIssuanceIsZero: boolean = false
  //storePreviousData: boolean = true,
  //runBeforeStore?: () => Promise<void>
) {
  const pegType = peggedAsset.pegType;
  let peggedBalances: PeggedAssetIssuance = {};
  let bridgedFromMapping: BridgeMapping = {};
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
            await getPeggedAsset(
              unixTimestamp,
              ethBlock,
              chainBlocks,
              peggedAsset,
              peggedBalances,
              chain,
              issuanceType,
              issuanceFunction,
              pegType,
              bridgedFromMapping,
              maxRetries
            );
          }
        );
        await Promise.all(peggedChainPromises);
      }
    );
    await Promise.all(peggedBalancesPromises);
    await calcCirculating(peggedBalances, bridgedFromMapping, pegType);

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
    const scope = new Sentry.Scope();
    scope.setTag("peggedAsset", peggedAsset.name);
    Sentry.AWSLambda.captureException(e, scope);
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

  try {
    // Checks circuit breakers
    const storeTokensAction = storeNewPeggedBalances(
      peggedAsset,
      unixTimestamp,
      peggedBalances,
      hourlyPeggedBalances,
      dailyPeggedBalances
    );
    await storeTokensAction;
  } catch (e) {
    console.error(peggedAsset.name, e);
    const scope = new Sentry.Scope();
    scope.setTag("peggedAsset", peggedAsset.name);
    Sentry.AWSLambda.captureException(e, scope);
    return;
  }

  return peggedBalances;
}
