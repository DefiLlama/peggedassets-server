const sdk = require("@defillama/sdk");
import {
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
import { solanaMintedOrBridged } from "../helper/getSupply";

const chainContracts = {
  solana: {
    issued: ["7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued),
    unreleased: async () => ({}),
  },
};

export default adapter;
