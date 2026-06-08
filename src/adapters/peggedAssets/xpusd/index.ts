const chainContracts = {
  ethereum: {
    issued: "0x31Bc2bAa782e5180e9EfA32261D2Bb33Ce8918Bc",
  },
  avax: {
    issued: "0xcc18b41a0f63c67f17f23388c848aec67b583422",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
