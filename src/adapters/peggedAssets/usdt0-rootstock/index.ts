const chainContracts = {
  rsk: {
    issued: ["0x779ded0c9e1022225f8e0630b35a9b54be713736"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
