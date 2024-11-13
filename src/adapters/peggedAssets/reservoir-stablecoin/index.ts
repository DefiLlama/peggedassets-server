const chainContracts = {
    ethereum: {
      issued: ["0x09d4214c03d01f49544c0448dbe3a27f768f2b34"],
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;