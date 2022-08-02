const sdk = require("@defillama/sdk");
import {
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
import { solanaMintedOrBridged } from "../helper/getSupply";

const chainContracts = {
  solana: {
    issued: ["USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued),
    unreleased: async () => ({}),
  },
};

export default adapter;
