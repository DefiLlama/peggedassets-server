const chainContracts = {
  ethereum: {
    issued: ["0x466a756e9a7401b5e2444a3fcb3c2c12fbea0a54"],
    unreleased: ["0x51c2cef9efa48e08557a361b52db34061c025a1b"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;