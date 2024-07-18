const chainContracts = {
    celo: {
      issued: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
      pegType: 'peggedREAL'
    },
  };
  
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;