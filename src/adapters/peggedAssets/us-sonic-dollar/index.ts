const chainContracts = {

    sonic: {
      issued: ["0x000000000eCcFf26B795F73fb0A70d48da657fEf"],
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;