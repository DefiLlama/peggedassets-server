
const chainContracts = {
  ethereum: {
    issued: ["0xd71ecff9342a5ced620049e616c5035f1db98620"],
  },
  optimism: {
    issued: ["0xFBc4198702E81aE77c06D58f81b629BDf36f0a71"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedEUR" });
export default adapter;
