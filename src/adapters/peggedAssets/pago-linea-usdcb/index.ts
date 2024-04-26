const chainContracts = {
  rsk: {
    issued: ["0xaa5dc2ea0e056fc962f48ab25547d66d3586ee8a"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
