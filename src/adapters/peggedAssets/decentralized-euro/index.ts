const chainContracts = {
  ethereum: {
    issued: ["0xba3f535bbcccca2a154b573ca6c5a49baae0a3ea"],
  },
  base: {
    bridgedFromETH: ["0x1b5f7fa46ed0f487f049c42f374ca4827d65a264"],
  },
  polygon: {
    bridgedFromETH: ["0xc2ff25dd99e467d2589b2c26edd270f220f14e47"],
  },
  optimism: {
    bridgedFromETH: ["0x1b5f7fa46ed0f487f049c42f374ca4827d65a264"],
  },
  arbitrum: {
    bridgedFromETH: ["0x5e85faf503621830ca857a5f38b982e0cc57d537"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedEUR" });
export default adapter;
