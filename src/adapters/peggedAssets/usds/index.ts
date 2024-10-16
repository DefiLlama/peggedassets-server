const chainContracts = {
    ethereum: {
      issued: ["0xdC035D45d973E3EC169d2276DDab16f1e407384F"],
    },
  };
  
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;