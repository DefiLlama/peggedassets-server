const chainContracts = {
    solana: {
      issued: ["5YMkXAYccHSGnHn9nob9xEvv6Pvka9DZWH7nTbotTu9E"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;