import type {
  Balances,
  PeggedAssetType,
  ChainBlocks,
} from "../peggedAsset.type";
import bridgeMapping, { BridgeID } from "../../../peggedData/bridgeData";
const axios = require("axios");
const retry = require("async-retry");

export function sumSingleBalance(
  balances: Balances,
  pegType: PeggedAssetType,
  balance: string | number,
  bridgeAddressOrName?: string,
  useBridgeMapping?: boolean,
  bridgedFromChain?: string
) {
  if (typeof balance === "number") {
    const prevBalance = balances[pegType] ?? 0;
    if (typeof prevBalance !== "number") {
      throw new Error(
        `Trying to merge string and number token balances for balance ${balance}`
      );
    }
    (balances[pegType] as number) = prevBalance + balance;
  } else {
    const prevBalance = BigInt(balances[pegType] ?? 0);
    const bBalance = BigInt(balance)
    balances[pegType] = (prevBalance + bBalance).toString();
  }
  if (bridgeAddressOrName) {
    appendBridgeData(
      balances,
      balance,
      bridgeAddressOrName,
      useBridgeMapping,
      bridgedFromChain
    );
  }
}

function appendBridgeData(
  balances: Balances,
  balance: string | number,
  bridgeAddressOrName: string,
  useBridgeMapping?: boolean,
  bridgedFromChain?: string
) {
  balances.bridges = balances.bridges || {};
  const bridgeID: BridgeID = useBridgeMapping
    ? bridgeMapping[bridgeAddressOrName]?.bridge ?? "not-found"
    : bridgeAddressOrName;
  const sourceChain = useBridgeMapping
    ? bridgeMapping[bridgeAddressOrName]?.sourceChain ?? "not-found"
    : bridgedFromChain ?? "not-found";
  balances.bridges[bridgeID] = balances.bridges[bridgeID] || {};
  balances.bridges[bridgeID][sourceChain] =
    balances.bridges[bridgeID][sourceChain] || {};
  if (typeof balance === "number") {
    const prevBridgeBalance =
      balances.bridges[bridgeID][sourceChain].amount ?? 0;
    if (typeof prevBridgeBalance !== "number") {
      throw new Error(
        `Trying to merge string and number token balances for balance ${balance}`
      );
    }
    (balances.bridges[bridgeID][sourceChain].amount as number) =
      prevBridgeBalance + balance;
  } else {
    const prevBridgeBalance = BigInt(balances.bridges[bridgeID]?.[sourceChain]?.amount ?? 0);
    const bBalance = BigInt(balance)
    balances.bridges[bridgeID][sourceChain].amount = (prevBridgeBalance + bBalance).toString()
  }
}

export async function sumMultipleBalanceFunctions(
  functions: any,
  pegType: PeggedAssetType
) {
  return async function (
    timestamp: number,
    ethBlock: number,
    chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let fnPromise of functions) {
      const fn = await fnPromise;
      const balance = await fn(timestamp, ethBlock, chainBlocks);
      mergeBalances(balances, pegType, balance);
    }
    return balances;
  };
}

function mergeBalances(
  balances: Balances,
  pegType: PeggedAssetType,
  balancesToMerge: Balances
) {
  const balance = balances[pegType];
  const balanceToMerge = balancesToMerge[pegType];
  if (!balance) {
    balances[pegType] = balanceToMerge;
  } else if (
    typeof balance === "number" &&
    typeof balanceToMerge === "number"
  ) {
    balances[pegType] = balance + balanceToMerge;
  } else {
    const prevBalance = BigInt(balanceToMerge);
    const bBalance = BigInt(balance)
    balances[pegType] = (prevBalance + bBalance).toString();
  }
  balances.bridges = balances.bridges || {};
  balancesToMerge.bridges = balancesToMerge.bridges || {};
  for (let bridgeID in balancesToMerge.bridges) {
    for (let sourceChain in balancesToMerge.bridges[bridgeID]) {
      if (balances?.bridges?.[bridgeID]?.[sourceChain]) {
        const bridgeBalance = balances.bridges[bridgeID][sourceChain].amount;
        const bridgeBalanceToMerge =
          balancesToMerge.bridges[bridgeID][sourceChain].amount;
        if (
          typeof bridgeBalance === "number" &&
          typeof bridgeBalanceToMerge === "number"
        ) {
          balances.bridges[bridgeID][sourceChain].amount =
            bridgeBalance + bridgeBalanceToMerge;
        } else {
          const prevBalance = BigInt(bridgeBalanceToMerge);
          const bBalance = BigInt(bridgeBalance ?? 0)
          balances.bridges[bridgeID][sourceChain].amount = (prevBalance + bBalance).toString();
        }
      } else {
        balances.bridges[bridgeID] = balances.bridges[bridgeID] || {};
        balances.bridges[bridgeID][sourceChain] =
          balancesToMerge.bridges[bridgeID][sourceChain];
      }
    }
  }
}


let tetherTransperancyCache: any

export function getTetherTransparency() {
  if (!tetherTransperancyCache) 
    tetherTransperancyCache = retry(
      async (_bail: any) =>
        await axios("https://app.tether.to/transparency.json")
    ).then((res: any) => res.data)
  return tetherTransperancyCache;
}