
const chainContracts = {
  ethereum: {
    issued: ["0xdf3ac4f479375802a821f7b7b46cd7eb5e4262cc"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;