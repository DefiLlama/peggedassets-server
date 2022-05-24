import { BridgeIDs } from "./peggedData/bridgeData";

export interface TokenPrices {
  [token: string]: {
    usd: number;
  };
}

type PeggedBalances = {
  [peggedAssetType: string]: number | null;
};
export type BridgeBalances = {
  [bridgeID in BridgeIDs]: number;
};
export type PeggedTokenBalance = PeggedBalances & {
  bridges?: BridgeBalances;
};

export type TokensValueLocked = {
  [tokenSymbolOrName: string]: number;
};

export type tvlsObject<T> = {
  [chain: string]: T;
};

export type PeggedAssetIssuance = {
  [chain: string]: {
    [issuanceType: string]: PeggedTokenBalance;
  };
};
