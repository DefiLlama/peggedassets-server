const sdk = require("@defillama/sdk");
import { PeggedIssuanceAdapter } from "../peggedAsset.type";
import { solanaMintedOrBridged } from "../helper/getSupply";

const chainContracts = {
  solana: {
    issued: ["Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued),
    unreleased: async () => ({}),
  },
};

export default adapter;
