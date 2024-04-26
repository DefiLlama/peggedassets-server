const chainContracts = {
  polygon: {
    issued: ["0x72C96C73207936E94066b4C8566C6987c9a1f1dE"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;