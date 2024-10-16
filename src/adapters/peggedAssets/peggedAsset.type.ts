import { BridgeID } from "../../peggedData/bridgeData";

export type ChainBlocks = {
  [x: string]: number;
};

export type PeggedAssetType =
  | "peggedUSD"
  | "peggedVAR"
  | "peggedEUR"
  | "peggedSGD"
  | "peggedJPY"
  | "peggedCNY"
  | "peggedUAH"
  | "peggedARS"
  | "peggedGBP"
  | "peggedCAD"
  | "peggedTRY"
  | "peggedCHF"
  | "peggedGOLD" //not used
  | "peggedCOP"
  | "peggedREAL"
  | "peggedAUD";

type StringNumber = string;
type PeggedBalances = {
  [peggedAssetType: string]: StringNumber | number;
};
type BridgeBalances = {
  [bridgeID in BridgeID]: {
    [source: string]: {
      amount: StringNumber | number;
    };
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
    // minted: Promise<Fetch> | (() => Promise<{}>) | undefined;
    // unreleased: Promise<Fetch> | (() => Promise<{}>) | undefined;
    [bridgedFrom: string]: Fetch | Promise<Fetch> | (() => Promise<{}>) | any;
  };
};

export type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};
