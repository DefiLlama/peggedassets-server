const chainContracts = {
  bsc: {
    issued: ["0x4bd17003473389a42daf6a0a729f6fdb328bbbd7"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
