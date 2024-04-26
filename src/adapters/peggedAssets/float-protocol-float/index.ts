const chainContracts = {
  ethereum: {
    issued: ["0xb05097849bca421a3f51b249ba6cca4af4b97cb9"], pegType: 'peggedVAR'
  },
}

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;