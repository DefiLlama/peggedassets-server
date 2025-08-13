const chainContracts = {
  sonic: {
    issued: ["0xE5Fb2Ed6832deF99ddE57C0b9d9A56537C89121D"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;