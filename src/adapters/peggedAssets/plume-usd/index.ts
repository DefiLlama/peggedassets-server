const chainContracts = {
  plume_mainnet: {
    issued: ["0xdddD73F5Df1F0DC31373357beAC77545dC5A6f3F"],
    pegType: "peggedUSD",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;