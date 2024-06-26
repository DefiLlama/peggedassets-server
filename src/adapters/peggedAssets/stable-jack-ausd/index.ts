const chainContracts = {
    avax: {
      issued: ["0xaBe7a9dFDA35230ff60D1590a929aE0644c47DC1"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
  