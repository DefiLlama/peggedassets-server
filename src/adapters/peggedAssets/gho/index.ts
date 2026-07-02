const chainContracts = {
  ethereum: {
    issued: ["0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f"],
  },
  monad: {
    bridgedFromETH: ["0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73"],
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;