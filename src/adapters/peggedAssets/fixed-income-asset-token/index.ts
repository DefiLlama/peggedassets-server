const chainContracts = {
  ethereum: {
    issued: ["0x586aa273f262909eef8fa02d90ab65f5015e0516"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
