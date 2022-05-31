import { BridgeIDs } from "../../peggedData/bridgeData";

export type ChainBlocks = {
  [x: string]: number;
};

export type PeggedAssetType = "peggedUSD";

type StringNumber = string;
type PeggedBalances = {
  [peggedAssetType: string]: StringNumber | number;
};
type BridgeBalances = {
  [bridgeID in BridgeIDs]: {
    amount: StringNumber | number;
    source: string;
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
