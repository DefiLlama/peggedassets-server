const chainContracts = {
  arbitrum: {
    issued: ["0x64343594ab9b56e99087bfa6f2335db24c2d1f17"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
