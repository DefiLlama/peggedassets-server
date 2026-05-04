const chainContracts = {
    solana: {
      issued: ["HVWf8JmLoHs99Lw8Psf3fyqAtA4crWxCPkrmSdNjhNH3"],
    },

  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;