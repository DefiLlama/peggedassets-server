
const chainContracts = {
  xdai: {
    issued: ["0xaf204776c7245bF4147c2612BF6e5972Ee483701"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;