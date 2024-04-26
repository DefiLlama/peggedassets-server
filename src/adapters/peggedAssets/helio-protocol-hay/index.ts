const chainContracts = {
  bsc: {
    issued: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;