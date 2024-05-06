const chainContracts = {
  ethereum: {
    issued: ["0xe2f2a5c287993345a840db3b0845fbc70f5935a5"],
  },
  xdai: {
    bridgedFromETH: ["0x7300AaFC0Ef0d47Daeb850f8b6a1931b40aCab33"],
  },
  polygon: {
    issued: ["0xE840B73E5287865EEc17d250bFb1536704B43B21"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;