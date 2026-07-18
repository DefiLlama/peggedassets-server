const chainContracts = {
  ethereum: {
    issued: ["0x23238f20b894f29041f48D88eE91131C395Aaa71"],
  },
  monad: {
    bridgedFromETH: ["0x0Bb150DFa86EA5d7742F07FEfCD8E8edA81D64eF"],
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, {}, { decimals: 6 });
export default adapter;
