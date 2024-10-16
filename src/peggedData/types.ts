type PegType =
  | "peggedUSD" //dollar
  | "peggedVAR" //variable
  | "peggedEUR" //europe/euro
  | "peggedSGD" //singapora
  | "peggedJPY" //japan
  | "peggedCNY" //china
  | "peggedUAH" //ukraine
  | "peggedARS" //ARGENTINE
  | "peggedGBP" //GB
  | "peggedCAD" //canadian dollar
  | "peggedTRY" //Turkish lira
  | "peggedXAU" //Gold this is not used
  | "peggedCHF" //Swiss franc
  | "peggedCOP" //colombian peso
  | "peggedREAL"//brazilian real 
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
};

type Bridge = {
  name: string;
  link?: string;
};

export type BridgeInfo = {
  [bridgeID: string]: Bridge;
};
