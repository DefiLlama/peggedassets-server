const chainContracts = {
    fuse: {
      issued: ["0xCE86a1cf3cFf48139598De6bf9B1dF2E0f79F86F"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;