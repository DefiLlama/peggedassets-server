const chainContracts = {
  ethereum: {
    issued: ["0xFAF0cEe6B20e2Aaa4B80748a6AF4CD89609a3d78"],
    reserves: ["0x4b3974aaabdc251b3086ae4a8163110d766c88c8", "0x1760bFB0f8461Fcf4c6768a82436840d23F40252", "0xa1B2A2dFe6300D3f2174e0a4f073Fc0F78F5169F"],
  },
  bsc: {
    issued: ["0xFAF0cEe6B20e2Aaa4B80748a6AF4CD89609a3d78"],
  },
  tron: {
    issued: ["TF39FD5YwW63mtB1zr9gpVdyFUx1icac2y"]
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;