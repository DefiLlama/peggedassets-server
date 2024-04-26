const chainContracts = {
  avax: {
    issued: ["0x111111111111ed1d73f860f57b2798b683f2d325"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;