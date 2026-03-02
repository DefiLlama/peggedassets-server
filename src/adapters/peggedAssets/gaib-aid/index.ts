import { addChainExports } from "../helper/getSupply";

const chainContracts = {
  ethereum: {
    issued: ["0x18F52B3fb465118731d9e0d276d4Eb3599D57596"],
  },
  arbitrum: {
    bridgedFromETH: ["0x18F52B3fb465118731d9e0d276d4Eb3599D57596"],
  },
  base: {
    bridgedFromETH: ["0x18F52B3fb465118731d9e0d276d4Eb3599D57596"],
  },
  bsc: {
    bridgedFromETH: ["0x18F52B3fb465118731d9e0d276d4Eb3599D57596"],
  },
};

const adapter = addChainExports(chainContracts);

export default adapter;
