const chainContracts = {
  strato: {
    issued: ["0x2c59ef92d08efde71fe1a1cb5b45f4f6d48fcc94"],
  },
};

import { addChainExports } from "../helper/getSupply";

const adapter = addChainExports(chainContracts);
export default adapter;
