
const chainContracts = {
  ethereum: {
    issued: ["0x2a8e1e676ec238d8a992307b495b45b3feaa5e86"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;