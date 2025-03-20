const chainContracts = {
  ethereum: {
    issued: ["0xbEeFc011e94f43b8B7b455eBaB290C7Ab4E216f1"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;