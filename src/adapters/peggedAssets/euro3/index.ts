const pegType = "peggedEUR";
const chainContracts = {
  polygon: {
    issued: "0xA0e4c84693266a9d3BBef2f394B33712c76599Ab", pegType
  },
  linea: {
    issued: "0x3f817b28da4940f018c6b5c0a11c555ebb1264f9", pegType
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
