const chainContracts = {
  bfc: {
    issued: ["0x6906Ccda405926FC3f04240187dd4fAd5DF6d555"], pegType: 'peggedVAR'
  },
  base: {
    bridgedFromBfc: ["0xe4b20925d9e9a62f1e492e15a81dc0de62804dd4"], pegType: 'peggedVAR'
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedVAR' })
export default adapter;
