const chainContracts = {
    ethereum: {
      issued: ["0x38547d918b9645f2d94336b6b61aeb08053e142c"],
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;