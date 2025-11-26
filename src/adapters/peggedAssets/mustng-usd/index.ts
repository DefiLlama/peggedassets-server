const chainContracts = {
    saga: {
        issued: ["0xA8b56ce258a7f55327BdE886B0e947EE059ca434"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;