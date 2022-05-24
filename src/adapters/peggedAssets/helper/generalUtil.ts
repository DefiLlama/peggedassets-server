import { BigNumber } from "ethers";
import type {
  Balances,
  PeggedAssetType,
  ChainBlocks,
} from "../peggedAsset.type";
import bridgeMapping, { BridgeIDs } from "../../../peggedData/bridgeData";

export function sumSingleBalance(
  balances: Balances,
  pegType: PeggedAssetType,
  balance: string | number,
  addressForBridgeInfo?: string,
  useBridgeMapping?: boolean
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

    if (addressForBridgeInfo) {
      const bridgeID: BridgeIDs = useBridgeMapping
        ? bridgeMapping[addressForBridgeInfo] ?? "not-found"
        : addressForBridgeInfo;
      const prevBridgeIDBalance = balances.bridges[bridgeID] ?? 0;
      if (typeof prevBridgeIDBalance !== "number") {
        throw new Error(
          `Trying to merge string and number token balances for balance ${balance}`
        );
      }
      (balances.bridges[bridgeID] as number) = prevBridgeIDBalance + balance;
    }
  } else {
    const prevBalance = BigNumber.from(balances[pegType] ?? "0");
    balances[pegType] = prevBalance.add(BigNumber.from(balance)).toString();

    if (addressForBridgeInfo) {
      const bridgeID = useBridgeMapping
        ? bridgeMapping[addressForBridgeInfo]
        : addressForBridgeInfo;
      const prevBridgeIDBalance = BigNumber.from(
        balances.bridges[bridgeID] ?? "0"
      );
      balances.bridges[bridgeID] = prevBridgeIDBalance
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
  if (typeof balance === "number" && typeof balanceToMerge === "number") {
    balances[pegType] = (balance ?? 0) + balanceToMerge;
  } else {
    balances[pegType] = BigNumber.from(balance ?? 0)
      .add(BigNumber.from(balanceToMerge))
      .toString();
  }
  for (let bridgeID in balancesToMerge.bridges) {
    if (balances.bridges[bridgeID]) {
      const bridgeBalance = balances.bridges[pegType];
      const bridgeBalanceToMerge = balancesToMerge.bridges[pegType];
      if (
        typeof bridgeBalance === "number" &&
        typeof bridgeBalanceToMerge === "number"
      ) {
        balances.bridges[bridgeID] =
          (bridgeBalance ?? 0) + bridgeBalanceToMerge;
      } else {
        balances.bridges[bridgeID] = BigNumber.from(bridgeBalance ?? 0)
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
