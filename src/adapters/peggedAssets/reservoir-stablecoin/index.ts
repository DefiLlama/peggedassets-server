const chainContracts = {
    ethereum: {
      issued: ["0x09d4214c03d01f49544c0448dbe3a27f768f2b34"],
    },
    berachain: {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    base: {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    "plume_mainnet": {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    sonic: {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    wc: {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    arbitrum: {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    sei: {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    unichain: {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    hyperliquid: {
      bridgedFromETH: ["0x866d66F64FB81461903E1e38d998E747EcF35E78"],
    },
    bsc: {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    avax: {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    katana: {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    solana: {
      bridgedFromETH: ["Ejqkht2dyN1BaaEtK92zBKY6S8HbVH8APB5sDK9Rmokt"],
    },
    linea: {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    monad: {
      bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;