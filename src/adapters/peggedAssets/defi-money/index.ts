const chainContracts = {
  optimism: {
    issued: ["0x69420f9e38a4e60a62224c489be4bf7a94402496"],
  },
  arbitrum: {
    issued: ["0x69420f9e38a4e60a62224c489be4bf7a94402496"],
  },
  base: {
    issued: ["0x69420f9e38a4e60a62224c489be4bf7a94402496"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
