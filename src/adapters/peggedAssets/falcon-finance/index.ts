import { addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts = {
  ethereum: {
    issued: ["0xFa2B947eEc368f42195f24F36d2aF29f7c24CeC2"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
};

export default adapter;
