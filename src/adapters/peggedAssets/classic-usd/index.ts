const chainContracts = {
  ethereumclassic: {
    issued: ["0xDE093684c796204224BC081f937aa059D903c52a"],
    pegType: 'peggedUSD',
  },
  polygon: {
    issued: ["0x131409b31bf446737dd04353d43dacada544b6fa"],
    pegType: 'peggedUSD',
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
