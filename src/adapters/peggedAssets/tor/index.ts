// TOR has a Multichain bridge to Ethereum, BSC, and Avax, but their contract addresses have not been found.
// Their Discord did not help provide them.
const chainContracts = {
  fantom: {
    issued: ["0x74e23df9110aa9ea0b6ff2faee01e740ca1c642e"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;