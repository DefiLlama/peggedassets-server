const chainContracts = {
    arbitrum: {
        issued: ["0x4ecf61a6c2FaB8A047CEB3B3B263B401763e9D49"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;