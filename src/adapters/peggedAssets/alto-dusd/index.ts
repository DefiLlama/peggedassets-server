const chainContracts = {
    ethereum: {
      issued: ["0x63d74d22E689C715a04F2C13962b1f77F443d35b"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  
  const adapter = addChainExports(chainContracts);
  export default adapter;