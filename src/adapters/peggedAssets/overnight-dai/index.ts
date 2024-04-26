const chainContracts = {
  arbitrum: {
    issued: ["0xeb8E93A0c7504Bffd8A8fFa56CD754c63aAeBFe8"],
  },
  optimism: {
    issued: ["0x970D50d09F3a656b43E11B0D45241a84e3a6e011"],
  },
  base: {
    issued: ["0x65a2508C429a6078a7BC2f7dF81aB575BD9D9275"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;