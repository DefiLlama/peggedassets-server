const chainContracts = {
  bsc: {
    issued: ["0x40ff3dea2eec93a7b71879874dc4407918da77a6"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
