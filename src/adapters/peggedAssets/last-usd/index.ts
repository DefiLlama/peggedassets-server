const chainContracts = {
    hyperliquid: {
      issued: ["0xca79db4b49f608ef54a5cb813fbed3a6387bc645"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;