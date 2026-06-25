const chainContracts = {
    ethereum: {
      issued: ["0x23238f20b894f29041f48D88eE91131C395Aaa71"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;