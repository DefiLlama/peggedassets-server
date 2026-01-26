const chainContracts = {
    ethereum: {
      issued: ["0xcCcc62962d17b8914c62D74FfB843d73B2a3cccC"],
    },
    megaeth: {
      issued: ["0xcCcc62962d17b8914c62D74FfB843d73B2a3cccC"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
