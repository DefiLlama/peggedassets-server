const chainContracts =  {
  ethereum: {
    issued: ["0xad6250f0bd49f7a1eb11063af2ce9f25b9597b0f"],
  },
}

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;