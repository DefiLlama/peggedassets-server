const chainContracts = {
  ethereum: {
    issued: ["0xaCdf0DBA4B9839b96221a8487e9ca660a48212be"],
  },
  base: {
    issued: ["0xCc7FF230365bD730eE4B352cC2492CEdAC49383e"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;