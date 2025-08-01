const chainContracts = {
    ethereum: {
      issued: ["0x66a1e37c9b0eaddca17d3662d6c05f4decf3e110"],
    },
    base: {
      bridgedFromETH: ["0x35E5dB674D8e93a03d814FA0ADa70731efe8a4b9"],
    },
    bsc: {
      bridgedFromETH: ["0x2492D0006411Af6C8bbb1c8afc1B0197350a79e9"],
    },
    berachain: {
      bridgedFromETH: ["0x2492D0006411Af6C8bbb1c8afc1B0197350a79e9"],
    },
    hyperliquid: {
      bridgedFromETH: ["0x0aD339d66BF4AeD5ce31c64Bc37B3244b6394A77"],
    },
    soneium: {
      bridgedFromETH: ["0xb1b385542b6e80f77b94393ba8342c3af699f15c"],
    },
  };

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;