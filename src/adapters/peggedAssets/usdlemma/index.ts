const chainContracts = {
  arbitrum: {
    issued: ["0xdb41ab644AbcA7f5ac579A5Cf2F41e606C2d6abc"],
  },
  optimism: {
    issued: ["0x96F2539d3684dbde8B3242A51A73B66360a5B541"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
