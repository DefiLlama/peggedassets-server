const chainContracts = {
  optimism: {
    issued: ["0xc5b001dc33727f8f26880b184090d3e252470d45"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;