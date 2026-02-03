const chainContracts = {
    plasma: {
      issued: ["0x6695c0f8706c5ace3bdf8995073179cca47926dc"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;