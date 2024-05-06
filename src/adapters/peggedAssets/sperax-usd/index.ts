const chainContracts = {
  arbitrum: {
    issued: ["0xd74f5255d557944cf7dd0e45ff521520002d5748"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;