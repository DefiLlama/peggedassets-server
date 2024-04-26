const chainContracts = {
  rsk: {
    issued: ["0x3a15461d8ae0f0fb5fa2629e9da7d66a794a6e37"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
