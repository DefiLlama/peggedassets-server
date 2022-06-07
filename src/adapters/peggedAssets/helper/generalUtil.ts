import { BigNumber } from "ethers";
import type {
  Balances,
  PeggedAssetType,
  ChainBlocks,
} from "../peggedAsset.type";
import bridgeMapping, { BridgeID } from "../../../peggedData/bridgeData";

export function sumSingleBalance(
  balances: Balances,
  pegType: PeggedAssetType,
  balance: string | number,
  bridgeAddressOrName?: string,
  useBridgeMapping?: boolean,
  bridgedFromChain?: string
) {
  balances.bridges = balances.bridges || {};
  if (typeof balance === "number") {
    const prevBalance = balances[pegType] ?? 0;
    if (typeof prevBalance !== "number") {
      throw new Error(
        `Trying to merge string and number token balances for balance ${balance}`
      );
    }
    (balances[pegType] as number) = prevBalance + balance;

    if (bridgeAddressOrName) {
      const bridgeID: BridgeID = useBridgeMapping
        ? bridgeMapping[bridgeAddressOrName]?.bridge ?? "not-found"
        : bridgeAddressOrName;
      const sourceChain = useBridgeMapping
        ? bridgeMapping[bridgeAddressOrName]?.sourceChain ?? "not-found"
        : bridgedFromChain ?? "not-found";
      balances.bridges[bridgeID] = balances.bridges[bridgeID] || {};
      balances.bridges[bridgeID].source = sourceChain;
      const prevBridgeIDBalance = balances.bridges[bridgeID]?.amount ?? 0;
      if (typeof prevBridgeIDBalance !== "number") {
        throw new Error(
          `Trying to merge string and number token balances for balance ${balance}`
        );
      }
      (balances.bridges[bridgeID].amount as number) =
        prevBridgeIDBalance + balance;
    }
  } else {
    const prevBalance = BigNumber.from(balances[pegType] ?? "0");
    balances[pegType] = prevBalance.add(BigNumber.from(balance)).toString();

    if (bridgeAddressOrName) {
      const bridgeID = useBridgeMapping
        ? bridgeMapping[bridgeAddressOrName]?.bridge
        : bridgeAddressOrName;
      const sourceChain = useBridgeMapping
        ? bridgeMapping[bridgeAddressOrName]?.sourceChain ?? "not-found"
        : bridgedFromChain ?? "not-found";
      balances.bridges[bridgeID] = balances.bridges[bridgeID] || {};
      balances.bridges[bridgeID].source = sourceChain;
      const prevBridgeIDBalance = BigNumber.from(
        balances.bridges[bridgeID]?.amount ?? "0"
      );
      balances.bridges[bridgeID].amount = prevBridgeIDBalance
        .add(BigNumber.from(balance))
        .toString();
    }
  }
}

async function mergeBalances(
  balances: Balances,
  pegType: PeggedAssetType,
  balancesToMerge: Balances
) {
  balances.bridges = balances.bridges || {};
  balancesToMerge.bridges = balancesToMerge.bridges || {};
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
    balances[pegType] = BigNumber.from(balance ?? 0)
      .add(BigNumber.from(balanceToMerge))
      .toString();
  }
  for (let bridgeID in balancesToMerge.bridges) {
    if (balances.bridges[bridgeID]) {
      const bridgeBalance = balances.bridges[bridgeID].amount;
      const bridgeBalanceToMerge = balancesToMerge.bridges[bridgeID].amount;
      if (
        typeof bridgeBalance === "number" &&
        typeof bridgeBalanceToMerge === "number"
      ) {
        balances.bridges[bridgeID].amount =
          (bridgeBalance ?? 0) + bridgeBalanceToMerge;
      } else {
        balances.bridges[bridgeID].amount = BigNumber.from(bridgeBalance ?? 0)
          .add(BigNumber.from(bridgeBalanceToMerge))
          .toString();
      }
    } else {
      balances.bridges[bridgeID] = balancesToMerge.bridges[bridgeID];
    }
  }
}

export async function multiFunctionBalance(
  functions: Promise<
    (
      timestamp: number,
      ethBlock: number,
      chainBlocks: ChainBlocks
    ) => Promise<Balances>
  >[],
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
