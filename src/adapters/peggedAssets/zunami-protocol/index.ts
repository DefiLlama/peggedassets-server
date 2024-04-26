const chainContracts = {
  ethereum: {
    issued: ["0xb40b6608B2743E691C9B54DdBDEe7bf03cd79f1c"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;