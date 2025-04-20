const chainContracts = {
  ethereum: {
    issued: ["0x7DC9748DA8E762e569F9269f48F69A1a9F8Ea761"],
  },
  metis: {
    bridgedFromETH: ["0x2d3D1a6982840Dd88bC2380Fd557F8A9D5e27a77"], 
  },
  manta: {
    bridgedFromETH: ["0x7DC9748DA8E762e569F9269f48F69A1a9F8Ea761"],
  },
  avax: {
    bridgedFromETH: ["0x7DC9748DA8E762e569F9269f48F69A1a9F8Ea761"],
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { decimals: 6});
export default adapter;