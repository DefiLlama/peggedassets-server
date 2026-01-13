const chainContracts = {
    ethereum: {
      issued: ["0x09d4214c03d01f49544c0448dbe3a27f768f2b34"],
    },
    berachain: {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    base: {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    "plume_mainnet": {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    sonic: {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    wc: {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    arbitrum: {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    sei: {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    unichain: {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    hyperliquid: {
      issued: ["0x866d66F64FB81461903E1e38d998E747EcF35E78"],
    },
    bsc: {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    avax: {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    katana: {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    solana: {
      issued: ["Ejqkht2dyN1BaaEtK92zBKY6S8HbVH8APB5sDK9Rmokt"],
    },
    linea: {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    },
    monad: {
      issued: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;