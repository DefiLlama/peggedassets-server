const chainContracts = {
    berachain: {
      issued: ["0x1ce0a25d13ce4d52071ae7e02cf1f6606f4c79d3"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;