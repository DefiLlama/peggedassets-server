const chainContracts = {
  ethereum: {
    issued: ["0x6fA0BE17e4beA2fCfA22ef89BF8ac9aab0AB0fc9", // A7A5 with rebase
            "0x0d57436f2d39c0664c6f0f2e349229483f87ea38"], // wA7A5 no rebase
  },
  tron: {
    issued: ["TLeVfrdym8RoJreJ23dAGyfJDygRtiWKBZ"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedRUB" });
export default adapter;