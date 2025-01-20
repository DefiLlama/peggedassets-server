const chainContracts = {
  metis: {
    issued: ["0x2d3D1a6982840Dd88bC2380Fd557F8A9D5e27a77"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;