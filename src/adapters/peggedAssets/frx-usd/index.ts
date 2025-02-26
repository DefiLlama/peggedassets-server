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
  ink: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  sonic: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  mode: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  metis: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  sei: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  xlayer: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  avax: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  polygon: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  polygon_zkevm: {
    bridgedFromETH: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;