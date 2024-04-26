const chainContracts = {
  polygon: {
    issued: ["0xec38621e72d86775a89c7422746de1f52bba5320"],
  },
  ethereum: {
    issued: ["0xa48F322F8b3edff967629Af79E027628b9Dd1298"],
  },
  arbitrum: {
    issued: ["0x8ec1877698acf262fe8ad8a295ad94d6ea258988"],
  },
  optimism: {
    issued: ["0xb396b31599333739a97951b74652c117be86ee1d"],
  },
  bsc: {
    issued: ["0x8ec1877698acf262fe8ad8a295ad94d6ea258988"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter
