type Bridges = {
  [chain: string]: {
    bridge: string;
    link?: string;
  };
};

type PeggedCategory = "stablecoins";
type PegType = "peggedUSD";
export type PriceSource = "chainlink" | "uniswap";

export type PeggedAsset = {
  id: string;
  name: string;
  address: string;
  symbol: string;
  url: string;
  description: string;
  chain: string;
  logo: null | string;
  gecko_id: string;
  cmcId: string;
  category: PeggedCategory;
  pegType: PegType;
  priceSource: PriceSource;
  chains: string[];
  twitter: string;
};

type Bridge = {
  name: string;
  link?: string;
};

export type BridgeInfo = {
  [bridgeID: string]: Bridge;
};
