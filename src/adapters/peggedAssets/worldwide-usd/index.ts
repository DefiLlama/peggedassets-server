const chainContracts = {
    ethereum: {
      issued: ["0x7Cd017ca5ddb86861FA983a34b5F495C6F898c41"],
    },
    polygon: {
      issued: ["0x7Cd017ca5ddb86861FA983a34b5F495C6F898c41"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;