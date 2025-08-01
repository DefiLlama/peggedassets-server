const chainContracts: ChainContracts = {
  bsc: {
    issued: ["0xaf44A1E76F56eE12ADBB7ba8acD3CbD474888122"],
  },
  solana: {
    issued: ["DUSDt4AeLZHWYmcXnVGYdgAzjtzU5mXUVnTMdnSzAttM"],
  },
};

import { ChainContracts, } from "../peggedAsset.type";
import { addChainExports } from "../helper/getSupply";

const adapter = addChainExports(chainContracts);
export default adapter;
