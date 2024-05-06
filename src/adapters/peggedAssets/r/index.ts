const chainContracts = {
  ethereum: {
    issued: ["0x183015a9bA6fF60230fdEaDc3F43b3D788b13e21"],
    unreleased: ["0x2ba26baE6dF1153e29813d7f926143f9c94402f3"],
  },
  base: {
    issued: ["0xafb2820316e7bc5ef78d295ab9b8bb2257534576"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;