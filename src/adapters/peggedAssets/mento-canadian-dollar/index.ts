import type { ChainContracts } from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  celo: {
    issued: ["0xff4Ab19391af240c311c54200a492233052B6325"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedCAD", });
export default adapter;