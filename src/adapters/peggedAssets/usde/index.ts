const sdk = require("@defillama/sdk");
import { PeggedIssuanceAdapter } from "../peggedAsset.type";
import { solanaMintedOrBridged } from "../helper/getSupply";

const chainContracts = {
  solana: {
    issued: ["8dt9fQhoRKuWCSAsYweG2UMF3rbcG9xzNCTWXXSmdmEi"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued),
  },
};

export default adapter;