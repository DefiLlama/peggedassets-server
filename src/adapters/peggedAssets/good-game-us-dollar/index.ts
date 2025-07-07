import { PeggedIssuanceAdapter } from "../peggedAsset.type";
import {
  bridgedSupply,
  solanaMintedOrBridged,
} from "../helper/getSupply";

const chainContracts: any = {
  evm: ["0xFFFFFF9936BD58a008855b0812B44D2c8dffE2aA"],
  solana: ["GGUSDyBUPFg5RrgWwqEqhXoha85iYGs6cL57SyK4G2Y7"],
};

const decimals = 6;

const adapter: PeggedIssuanceAdapter = {
  polygon: {
    minted: bridgedSupply("polygon", decimals, chainContracts.evm),
  },
  bsc: {
    polygon: bridgedSupply("bsc", decimals, chainContracts.evm),
  },
  solana: {
    polygon: solanaMintedOrBridged(chainContracts.solana),
  }
};

export default adapter;


