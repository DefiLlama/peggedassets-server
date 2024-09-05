const chainContracts = {
  base: {
    issued: "0x613ce28076289DE255f1a6487437F03E37E4a71d",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;