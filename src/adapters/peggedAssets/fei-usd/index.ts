const chainContracts = {
  ethereum: {
    issued: ["0x956F47F50A910163D8BF957Cf5846D573E7f87CA"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;