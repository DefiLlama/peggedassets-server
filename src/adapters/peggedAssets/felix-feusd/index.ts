const chainContracts = {
    hyperliquid: {
      issued: ["0x02c6a2fA58cC01A18B8D9E00eA48d65E4dF26c70"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;