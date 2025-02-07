const chainContracts = {
    ethereum: {
      issued: ["0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5"],
    },
    arbitrum: {
      issued: ["0x35f1C5cB7Fb977E669fD244C567Da99d8a3a6850"],
    },
  };
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;