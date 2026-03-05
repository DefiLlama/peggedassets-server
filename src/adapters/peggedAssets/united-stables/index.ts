const chainContracts = {

  bsc: {
    issued: ["0xce24439f2d9c6a2289f741120fe202248b666666"],
  },
  ethereum: {
    issued: ["0xce24439f2d9c6a2289f741120fe202248b666666"],
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
