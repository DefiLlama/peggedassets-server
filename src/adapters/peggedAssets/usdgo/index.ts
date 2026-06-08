const sdk = require("@defillama/sdk");
import { PeggedIssuanceAdapter } from "../peggedAsset.type";
import { solanaMintedOrBridged } from "../helper/getSupply";

const chainContracts = {
  solana: {
    issued: ["72puLt71H93Z9CzHuBRTwFpL4TG3WZUhnoCC7p8gxigu"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued),
  },
};

export default adapter;
