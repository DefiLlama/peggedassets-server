const chainContracts = {
  base: {
    issued: ["0xb170000aeeFa790fa61D6e837d1035906839a3c8"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;