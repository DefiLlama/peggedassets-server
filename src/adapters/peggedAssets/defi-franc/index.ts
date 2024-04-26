const chainContracts = {
  ethereum: {
    issued: "0x045da4bFe02B320f4403674B3b7d121737727A36", pegType: 'peggedVAR'
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;