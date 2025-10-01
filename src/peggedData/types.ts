type PegType =
  | "peggedUSD" //dollar
  | "peggedVAR" //variable
  | "peggedEUR" //europe/euro
  | "peggedSGD" //singapora
  | "peggedJPY" //japan
  | "peggedCNY" //china
  | "peggedMXN" //mexican peso
  | "peggedUAH" //ukraine
  | "peggedARS" //ARGENTINE
  | "peggedGBP" //GB
  | "peggedCAD" //canadian dollar
  | "peggedTRY" //Turkish lira
  | "peggedXAU" //Gold this is not used
  | "peggedCHF" //Swiss franc
  | "peggedCOP" //colombian peso
  | "peggedREAL"//brazilian real 
  | "peggedRUB" //russian ruble
  | "peggedAUD"; //Australian currency

type PegMechanism = "algorithmic" | "fiat-backed" | "crypto-backed";

export type PriceSource =
  | "chainlink"
  | "uniswap"
  | "dexscreener"
  | "curve"
  | "coingecko"
  | "birdeye"
  | "kucoin"
  | "defillama"
  | "kaddex";

export type PeggedAsset = {
  id: string;
  name: string;
  address: string;
  symbol: string;
  url: string;
  description: string;
  mintRedeemDescription: string;
  onCoinGecko: string;
  gecko_id: string;
  cmcId: string;
  pegType: PegType;
  pegMechanism: PegMechanism;
  priceSource: PriceSource;
  auditLinks: string[];
  twitter: string;
  wiki: string;
  delisted?: boolean;
  deadFrom?: string;
  doublecounted?: boolean;
  deprecated?: boolean;
  yieldBearing?: boolean;
  module?: string;  // adapter module to use, defaults to gecko_id if not set
};

type Bridge = {
  name: string;
  link?: string;
};

export type BridgeInfo = {
  [bridgeID: string]: Bridge;
};
