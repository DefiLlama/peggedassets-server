const sdk = require("@defillama/sdk");
import { PeggedIssuanceAdapter } from "../peggedAsset.type";
import { solanaMintedOrBridged } from "../helper/getSupply";

const chainContracts = {
  solana: {
    issued: ["J9BcrQfX4p9D1bvLzRNCbMDv8f44a9LFdeqNE4Yk2WMD"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued),
    unreleased: async () => ({}),
  },
};

export default adapter;
