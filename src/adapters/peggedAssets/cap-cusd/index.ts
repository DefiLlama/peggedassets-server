const chainContracts = {
    ethereum: {
      issued: ["0xcCcc62962d17b8914c62D74FfB843d73B2a3cccC"],
    },
    megaeth: {
      issued: ["0xcCcc62962d17b8914c62D74FfB843d73B2a3cccC"],
    },
    tempo: {
      issued: ["0x20c0000000000000000000000520792dcccccccc"], // cUSD on Tempo Mainnet (Stargate Hydra OFT, decimals=6)
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
