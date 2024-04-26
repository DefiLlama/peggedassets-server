const chainContracts = {
  manta: {
    issued: ["0xcd91716ef98798A85E79048B78287B13ae6b99b2"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;