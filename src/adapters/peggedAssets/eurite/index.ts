const pegType = "peggedEUR";
const chainContracts = {
  ethereum: {
    issued: "0x9d1a7a3191102e9f900faa10540837ba84dcbae7", pegType
  },
  bsc: {
    issued: "0x9d1a7a3191102e9f900faa10540837ba84dcbae7", pegType
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
