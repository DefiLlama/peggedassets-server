const chainContracts = {
  etlk: {
    issued: ["0x6bDE51212203aE5d592Cc5180DA2ABBd41c922dE"],
  },
  ethereum: {
    issued: ["0x399B29975CBE313C56269cD5097F5AE097Fa2741"],
  },
  base: {
    issued: ["0x26C358F7c5fEdB20a6ddEf108cD91Efb6B8Da0Cb"],
  },
  arbitrum: {
    issued: ["0x26C358F7c5fEdB20a6ddEf108cD91Efb6B8Da0Cb"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
