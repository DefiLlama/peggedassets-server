import type { ChainContracts } from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  celo: {
    issued: ["0x456a3D042C0DbD3db53D5489e98dFb038553B0d0"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedKES", });
export default adapter;
