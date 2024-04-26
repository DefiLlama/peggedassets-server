
const pegType = "peggedGBP";

const chainContracts = {
  ethereum: {
    issued: ["0xD711D7D893de57dc13Ff465763218770Bd42DB1D"], pegType,
  },
  polygon: {
    issued: ["0xD711D7D893de57dc13Ff465763218770Bd42DB1D"], pegType
  },
  bsc: {
    issued: ["0xD711D7D893de57dc13Ff465763218770Bd42DB1D"], pegType
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;