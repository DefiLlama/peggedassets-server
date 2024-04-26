const chainContracts = {
  ethereum: {
    issued: ["0x2A54bA2964C8Cd459Dc568853F79813a60761B58"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;