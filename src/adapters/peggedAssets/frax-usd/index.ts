const chainContracts = {
  ethereum: {
    issued: ["0xcacd6fd266af91b8aed52accc382b4e165586e29"],
  },
  fraxtal: {
    issued: ["0xfc00000000000000000000000000000000000001"],
  },
  blast: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  arbitrum: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  optimism: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  bsc: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  ink: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  sonic: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  mode: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  // metis: {
  //   issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  // },
  sei: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  xlayer: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  avax: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  polygon: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  polygon_zkevm: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

// frxUSD, use LayerZero OFT (Mint-Burn) Modal to bridge 