const chainContracts = {
  avax: {
    issued: ["0xdaCDe03d7Ab4D81fEDdc3a20fAA89aBAc9072CE2"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;