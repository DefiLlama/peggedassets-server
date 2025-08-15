
import { addChainExports } from "../helper/getSupply";

const chainContracts = {
    ethereum: {
      issued: ["0x9cf12ccd6020b6888e4d4c4e4c7aca33c1eb91f8"],
    },
  };
  
  const adapter = addChainExports(chainContracts);
  export default adapter;