const chainContracts = {
    avax: {
      issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
    },
    ethereum: {
      issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
    },
  }
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;