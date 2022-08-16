import { BridgeID } from "./peggedData/bridgeData";

export interface TokenPrices {
  [token: string]: {
    usd: number;
  };
}

type PeggedBalances = {
  [peggedAssetType: string]: number | null;
};
export type BridgeBalances = {
  [bridgeID in BridgeID]: {
    [source: string]: {
    amount: number;
    }
  };
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

export type StoredPeggedAssetIssuance = {
  [chain: string]: {
    [issuanceType: string]: PeggedTokenBalance;
  } | string | number;
};
