const chainContracts = {
  sonic: {
    bridgedFromETH: ["0xE5Fb2Ed6832deF99ddE57C0b9d9A56537C89121D"],
  },
  ethereum: {
    issued: ["0x4ba01f22827018b4772CD326C7627FB4956A7C00"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;