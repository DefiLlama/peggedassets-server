type Bridges = {
  [chain: string]: {
    bridge: string;
    link?: string;
  };
};

type PegType = "peggedUSD" | "peggedVAR";
type PegMechanism = "algorithmic" | "fiat-backed" | "crypto-backed";
export type PriceSource = "chainlink" | "uniswap" | "dexscreener" | "curve" | "coingecko" | "birdeye";

export type PeggedAsset = {
  id: string;
  name: string;
  address: string;
  symbol: string;
  url: string;
  description: string;
  mechanismDescription: string;
  chain: string;
  logo: null | string;
  onCoinGecko: boolean;
  gecko_id: string;
  cmcId: string;
  pegType: PegType;
  pegMechanism: PegMechanism;
  priceSource: PriceSource;
  chains: string[];
  auditLinks: string[];
  twitter: string;
  wiki: string;
};

type Bridge = {
  name: string;
  link?: string;
};

export type BridgeInfo = {
  [bridgeID: string]: Bridge;
};
