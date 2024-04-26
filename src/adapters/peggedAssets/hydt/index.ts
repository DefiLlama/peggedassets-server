const chainContracts = {
  bsc: {
    issued: ["0x9810512Be701801954449408966c630595D0cD51"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
