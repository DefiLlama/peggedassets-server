const chainContracts = {
    hyperliquid: {
      issued: ["0xb5fe77d323d69eb352a02006ea8ecc38d882620c"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;