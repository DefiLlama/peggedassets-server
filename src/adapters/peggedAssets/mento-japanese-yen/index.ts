import type { ChainContracts } from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  celo: {
    issued: ["0xc45ecf20f3cd864b32d9794d6f76814ae8892e20"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedJPY", });
export default adapter;