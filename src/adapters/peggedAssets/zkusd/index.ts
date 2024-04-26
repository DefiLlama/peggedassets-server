const chainContracts = {
  era: {
    issued: ["0xfc7e56298657b002b3e656400e746b7212912757"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;