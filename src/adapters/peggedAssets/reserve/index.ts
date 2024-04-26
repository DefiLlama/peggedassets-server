const chainContracts = {
  ethereum: {
    issued: ["0x196f4727526ea7fb1e17b2071b3d8eaa38486988"],
  },
  xdai: {
    bridgedFromETH: ["0xD9C31db155a48f3d7304De85EC7AB7B705659bE9"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;