const chainContracts = {
  ethereum: {
    issued: ["0xf7d85ec4e7710f71992752eac2111312e73e9c9c"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
