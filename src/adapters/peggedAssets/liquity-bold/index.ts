import { addChainExports } from "../helper/getSupply";

const chainContracts = {
    ethereum: {
        issued: ["0x6440f144b7e50D6a8439336510312d2F54beB01D"],
    },
    base: {
        bridgedFromETH: ["0x03569CC076654F82679C4BA2124D64774781B01D"],
      },
      arbitrum: {
        bridgedFromETH: ["0x03569CC076654F82679C4BA2124D64774781B01D"],
      },
      optimism: {
        bridgedFromETH: ["0x03569CC076654F82679C4BA2124D64774781B01D"],
      },
      scroll: {
        bridgedFromETH: ["0x03569CC076654F82679C4BA2124D64774781B01D"],
      },
      avax: {
        bridgedFromETH: ["0x03569CC076654F82679C4BA2124D64774781B01D"],
      },
      hyperliquid: {
      bridgedFromETH: ["0x84533b1512A3A23F0c9668D88FDf86FEffdbb11A"],
    },
};

const adapter = addChainExports(chainContracts);
export default adapter;
