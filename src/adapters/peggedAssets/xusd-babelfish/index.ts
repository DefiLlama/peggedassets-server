const chainContracts = {
  rsk: {
    issued: ["0xb5999795be0ebb5bab23144aa5fd6a02d080299f"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;