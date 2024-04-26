const chainContracts = {
  ethereum: {
    issued: ["0xa4335da338ec4C07C391Fc1A9bF75F306adadc08"],
  },
  polygon: {
    issued: ["0xa4335da338ec4C07C391Fc1A9bF75F306adadc08"],
  },
  bsc: {
    issued: ["0xa4335da338ec4C07C391Fc1A9bF75F306adadc08"],
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;