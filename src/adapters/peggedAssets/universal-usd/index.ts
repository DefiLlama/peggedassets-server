const chainContracts = {
  ethereum: {
    issued: ["0xe4ca6596d2c28014c6f89964f57838e0be9f369b"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
