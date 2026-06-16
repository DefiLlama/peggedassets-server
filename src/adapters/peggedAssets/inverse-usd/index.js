const chainContracts = {
  ethereum: {
    issued: ["0x5377680B5986296AA4F9e684e5315a4F24832e56"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;