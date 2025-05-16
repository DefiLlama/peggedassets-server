const chainContracts = {
  swellchain: {
    issued: ["0x0000bAa0b1678229863c0A941C1056b83a1955F5"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;