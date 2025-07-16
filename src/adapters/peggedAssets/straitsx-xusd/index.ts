const chainContracts =  {
    ethereum: {
      issued: ["0xC08e7E23C235073C6807C2EFE7021304cb7c2815"],
    },
    bsc: {
    issued: ["0xF81aC2E1A0373ddE1BcE01E2Fe694a9b7E3bfcB9"],
      }
  }
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;