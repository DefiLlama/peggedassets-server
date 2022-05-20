export interface Protocol {
  id: string;
  name: string;
  address: string;
  symbol: string;
  url: string;
  description: string;
  chain: string;
  logo: null | string;
  audits: null | "0" | "1" | "2" | "3";
  audit_note: null;
  gecko_id: string;
  cmcId: string;
  category: string;
  chains: string[];
  oracles: string[];
  forkedFrom: string[];
  module: string;
  twitter: string;
  language?: string;
  audit_links?: string[];
  listedAt?: number;
  openSource?: boolean;
}

type Bridges = {
  [chain: string]: {
    bridge: string;
    link?: string;
  };
};

type PeggedCategory = "stablecoins";
type PegType = "peggedUSD";
export type PriceSource = 'chainlink' | 'uniswap'

export interface PeggedAsset {
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
  bridges: Bridges;
  twitter: string;
}
