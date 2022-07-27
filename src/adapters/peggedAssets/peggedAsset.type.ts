import { BridgeID } from "../../peggedData/bridgeData";

export type ChainBlocks = {
  [x: string]: number;
};

export type PeggedAssetType = "peggedUSD" | "peggedVAR" | "peggedEUR" | "peggedSGD" | "peggedJPY" | "peggedCNY";

type StringNumber = string;
type PeggedBalances = {
  [peggedAssetType: string]: StringNumber | number;
};
type BridgeBalances = {
  [bridgeID in BridgeID]: {
    [source: string]: {
    amount: StringNumber | number;
    }
  };
};
export type Balances = PeggedBalances & {
  bridges?: BridgeBalances;
};

export type Fetch = (
  timestamp: number,
  ethBlock: number,
  chainBlocks: ChainBlocks
) => Promise<Balances>;

export type PeggedIssuanceAdapter = {
  [chain: string]: {
    minted: Promise<Fetch> | (() => Promise<{}>);
    unreleased: Promise<Fetch> | (() => Promise<{}>);
    [bridgedFrom: string]: Promise<Fetch> | (() => Promise<{}>);
  };
};

export type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};
