
const chainContracts = {
  sonic: {
    issued: ["0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE"],
  },
}; 

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;