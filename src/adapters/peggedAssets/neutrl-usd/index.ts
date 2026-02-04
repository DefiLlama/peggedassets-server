const chainContracts = {
    ethereum: {
      issued: ["0xe556aba6fe6036275ec1f87eda296be72c811bce"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;