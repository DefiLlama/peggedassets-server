const chainContracts: ChainContracts = {
    solana: {
      issued: ["iAUSDhn2B61LBeCgph6JFxxS5KMYoyeXCbJZ4gyZLr7"],
    },
  };
  
  import { ChainContracts, } from "../peggedAsset.type";
  import { addChainExports } from "../helper/getSupply";
  
  const adapter = addChainExports(chainContracts);
  export default adapter;
  