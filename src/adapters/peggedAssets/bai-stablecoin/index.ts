const chainContracts = {
  astar: {
    issued: ["0x733ebcC6DF85f8266349DEFD0980f8Ced9B45f35"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;