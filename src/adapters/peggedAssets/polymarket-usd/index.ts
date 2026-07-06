const chainContracts = {
  polygon: {
    issued: ["0xc011a7e12a19f7b1f670d46f03b03f3342e82dfb"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { decimals: 6 });
export default adapter;
