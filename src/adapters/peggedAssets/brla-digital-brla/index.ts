import { addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

const pegType = "peggedREAL";

const chainContracts = {
  polygon: {
    issued: "0xe6a537a407488807f0bbeb0038b79004f19dddfb", pegType
  },
  xdai: {
    issued: "0xfecb3f7c54e2caae9dc6ac9060a822d47e053760", pegType
  },
  celo: {
    issued: "0xfecb3f7c54e2caae9dc6ac9060a822d47e053760", pegType
  },
  moonbeam: {
    issued: "0xfeb25f3fddad13f82c4d6dbc1481516f62236429", pegType
  },
} as any;

const adapter: PeggedIssuanceAdapter = addChainExports(chainContracts, undefined, { pegType });

export default adapter;
