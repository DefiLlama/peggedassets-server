const chainContracts = {
  ethereumclassic: {
    issued: ["0xDE093684c796204224BC081f937aa059D903c52a"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
