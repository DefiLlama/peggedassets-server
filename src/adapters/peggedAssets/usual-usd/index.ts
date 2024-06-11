const chainContracts = {
    ethereum: {
      issued: ["0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5"],
    },
  };
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;