import { addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts = {
  sui: {
    issued: [
      "0x44f838219cf67b058f3b37907b655f226153c18e33dfcd0da559a844fea9b1c1::usdsui::USDSUI",
    ],
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
};

export default adapter;