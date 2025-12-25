const chainContracts = {
    hyperliquid: {
      issued: ["0x111111a1a0667d36bd57c0a9f569b98057111111"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;