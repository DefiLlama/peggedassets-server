import { addChainExports } from "../helper/getSupply";

const pegType = "peggedREAL";

const chainContracts = {
  polygon: {
    issued: ["0xe6a537a407488807f0bbeb0038b79004f19dddfb"],
  },
  xdai: {
    issued: ["0xfecb3f7c54e2caae9dc6ac9060a822d47e053760"],
  },
  celo: {
    issued: ["0xfecb3f7c54e2caae9dc6ac9060a822d47e053760"],
  },
  moonbeam: {
    issued: ["0xfeb25f3fddad13f82c4d6dbc1481516f62236429"],
  },
};

const adapter = addChainExports(chainContracts, undefined, { pegType });

export default adapter;
