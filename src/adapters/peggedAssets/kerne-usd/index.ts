const chainContracts = {
  base: {
    issued: ["0x5C2EfdF0D8D286959b42308966bc2B97f5680AA3"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
