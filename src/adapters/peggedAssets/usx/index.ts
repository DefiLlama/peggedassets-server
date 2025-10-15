const chainContracts = {
    solana: {
      issued: ["6FrrzDk5mQARGc1TDYoyVnSyRdds1t4PbtohCD6p3tgG"],
    },
  };
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;