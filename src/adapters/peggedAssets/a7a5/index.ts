
const pegType = "peggedRUB";
const chainContracts = {
  ethereum: {
    issued: "0x6fA0BE17e4beA2fCfA22ef89BF8ac9aab0AB0fc9", pegType
  },
  tron: {
    issued: "TLeVfrdym8RoJreJ23dAGyfJDygRtiWKBZ", pegType
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType });
export default adapter;
