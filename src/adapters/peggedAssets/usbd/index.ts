const chainContracts = {
    ethereum: {
      issued: ["0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c"],
    },
    core: {
      issued: ["0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;