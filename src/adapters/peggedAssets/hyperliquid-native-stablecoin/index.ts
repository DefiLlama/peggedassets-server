const chainContracts = {
    hyperliquid: {
      issued: ["0x111111a1a0667d36bd57c0a9f569b98057111111"],
      unreleased: [
        "0x4c2c0f0bb2631b02ac9299c59690914ee7a200b8",
        "0xc5c21723fdd9e74fd853dd19c8dded71c3767cc2",
      ],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;