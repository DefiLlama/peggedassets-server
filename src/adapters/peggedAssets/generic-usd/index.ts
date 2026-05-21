const chainContracts = {
  citrea: {
    issued: ["0xac8c1aeb584765db16ac3e08d4736cfce198589b"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
