const chainContracts = {
    ethereum: {
      issued: ["0xa39986f96b80d04e8d7aeaaf47175f47c23fd0f4"],
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;