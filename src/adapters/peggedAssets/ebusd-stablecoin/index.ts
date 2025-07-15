const chainContracts = {
    ethereum: {
      issued: ["0x09fD37d9AA613789c517e76DF1c53aEce2b60Df4"],
    },
  };
  
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;