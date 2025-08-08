
import { addChainExports } from "../helper/getSupply";

const chainContracts = {
    ethereum: {
      issued: ["0x85e30b8b263bc64d94b827ed450f2edfee8579da"],
    },
  };
  
  const adapter = addChainExports(chainContracts);
  export default adapter;