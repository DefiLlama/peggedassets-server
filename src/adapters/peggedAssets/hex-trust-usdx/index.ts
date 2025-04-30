const chainContracts = {
  ethereum: {
    issued: ["0x7a486f809c952a6f8dec8cb0ff68173f2b8ed56c"],
  },
  flare: {
    issued: ["0x4A771Cc1a39FDd8AA08B8EA51F7Fd412e73B3d2B"],
  },
  songbird: {
    issued: ["0x4A771Cc1a39FDd8AA08B8EA51F7Fd412e73B3d2B"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;