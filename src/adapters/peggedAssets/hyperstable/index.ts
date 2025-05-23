const chainContracts = {
    hyperliquid: {
      issued: ["0x8ff0dd9f9c40a0d76ef1bcfaf5f98c1610c74bd8"],
    },
  };

  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;