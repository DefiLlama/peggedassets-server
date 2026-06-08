const chainContracts = {
  strato: {
    issued: ["0xcdc93d30182125e05eec985b631c7c61b3f63ff0"],
  },
};

import { addChainExports } from "../helper/getSupply";

const adapter = addChainExports(chainContracts);
export default adapter;
