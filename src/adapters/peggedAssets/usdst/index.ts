const chainContracts = {
  strato: {
    issued: ["0x937efa7e3a77e20bbdbd7c0d32b6514f368c1010"],
  },
};

import { addChainExports } from "../helper/getSupply";

const adapter = addChainExports(chainContracts);
export default adapter;
