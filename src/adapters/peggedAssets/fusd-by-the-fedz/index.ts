const chainContracts = {
  arbitrum: {
    issued: ["0x894341be568eae3697408c420f1d0acfce6e55f9"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
