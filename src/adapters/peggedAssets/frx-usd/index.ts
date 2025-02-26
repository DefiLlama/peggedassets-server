const chainContracts = {
  ethereum: {
    issued: ["0xcacd6fd266af91b8aed52accc382b4e165586e29"],
  },
  fraxtal: {
    issued: ["0xfc00000000000000000000000000000000000001"],
  },
  blast: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  arbitrum: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  optimism: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  bsc: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  /*ink: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },*/
  sonic: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  mode: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  metis: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
 /* sei: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },*/
  xlayer: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  avax: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  polygon: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  polygon_zkevm: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;