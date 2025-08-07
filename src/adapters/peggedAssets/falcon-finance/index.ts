import { addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts = {
  ethereum: {
    issued: ["0xFa2B947eEc368f42195f24F36d2aF29f7c24CeC2"],
  },
  bsc: {
    bridgedFromETH: "0xb3b02E4A9Fb2bD28CC2ff97B0aB3F6B3Ec1eE9D2",
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
};

export default adapter;
