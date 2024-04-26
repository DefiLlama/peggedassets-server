const chainContracts = {
  bfc: {
    issued: ["0x6906Ccda405926FC3f04240187dd4fAd5DF6d555"], pegType: 'peggedVAR'
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
