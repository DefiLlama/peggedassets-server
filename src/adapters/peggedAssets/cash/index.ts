const chainContracts = {
    solana: {
      issued: ["CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;