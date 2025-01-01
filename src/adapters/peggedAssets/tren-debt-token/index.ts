//const sdk = require("@defillama/sdk");

/*const chainContracts = {
  arbitrum: {
    minted: "0xD4fe6e1e37dfCf35E9EEb54D4cca149d1c10239f", 
    curvePool: "0x2b2e23b7c1b0de9040011b860cc575650d0817f7", 
  },
  ethereum: {
    bridgedFromArbitrum: "0xe9766D6aed0A73255f95ACC1F263156e746B70ba",
  },
};*/



const chainContracts = {
  arbitrum: {
    issued: ["0xD4fe6e1e37dfCf35E9EEb54D4cca149d1c10239f"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
