import type { ChainContracts } from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  celo: {
    issued: ["0xc45ecf20f3cd864b32d9794d6f76814ae8892e20"],
  },
  monad: {
    issued: ["0x22f6A6752800eAB67b84748FeFc3cC658384aF72"],
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedJPY", });
export default adapter;