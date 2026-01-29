const chainContracts = {

    ethereum: {
      issued: ["0x07041776f5007ACa2A54844F50503a18A72A8b68"],
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;