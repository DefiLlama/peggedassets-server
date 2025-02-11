const chainContracts = {
  berachain: {
    issued: ["0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;