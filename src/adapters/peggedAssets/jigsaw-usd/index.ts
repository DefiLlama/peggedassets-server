const chainContracts = {
    ethereum: {
      issued: ["0x000000096cb3d4007fc2b79b935c4540c5c2d745"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;