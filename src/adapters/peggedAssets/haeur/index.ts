const chainContracts = {
  ethereum: {
    issued: ["0x83Fd69E0FF5767972b46E61C6833408361bF7346"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedEUR" });
export default adapter;
