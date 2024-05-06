const chainContracts = {
  ethereum: {
    issued: ["0x056fd409e1d7a124bd7017459dfea2f387b6d5cd"],
  },
  wan: {
    bridgedFromETH: ["0xcF422327dDaAa409C2976d01131d8a3457F03251"],
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;