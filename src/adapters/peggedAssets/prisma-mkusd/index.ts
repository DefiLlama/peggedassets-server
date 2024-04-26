
const chainContracts = {
  ethereum: {
    issued: ["0x4591dbff62656e7859afe5e45f6f47d3669fbb28"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;