const chainContracts = {
  ethereum: {
    issued: ["0x5a7E6C8204A1359DB9AAcab7bA5Fc309B7981eFd"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
