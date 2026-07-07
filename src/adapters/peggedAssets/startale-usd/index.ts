const chainContracts = {
  soneium: {
    issued: ["0x3f99231dd03a9f0e7e3421c92b7b90fbe012985a"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
