const chainContracts = {
    ethereum: {
      issued: ["0x0000206329b97DB379d5E1Bf586BbDB969C63274"],
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;