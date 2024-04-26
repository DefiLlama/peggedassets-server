const chainContracts = {
  blast: {
    issued: ["0x4300000000000000000000000000000000000003"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
