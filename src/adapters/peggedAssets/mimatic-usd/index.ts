const chainContracts = {
    polygon: {
      issued: ["0xa3fa99a148fa48d14ed51d610c367c61876997f1"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;