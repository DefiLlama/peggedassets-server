const chainContracts = {
  ethereum: {
    issued: ["0x78da5799CF427Fee11e9996982F4150eCe7a99A7"],
  },
  base: {
    bridgedFromETH: ["0x8E5E9DF4F0EA39aE5270e79bbABFCc34203A3470"],
  },
  arbitrum: {
    bridgedFromETH: ["0x96a993f06951b01430523d0d5590192d650ebf3e"],
  },
}

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;