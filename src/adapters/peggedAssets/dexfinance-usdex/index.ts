const chainContracts = {
    arbitrum: {
      issued: ["0x4117ec0a779448872d3820f37ba2060ae0b7c34b"],
    },
    manta: {
      issued: ["0x6Da9EbD271a0676F39C088a2b5fd849D5080c0af"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
  