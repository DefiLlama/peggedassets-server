const chainContracts = {
  bsc: {
    issued: ["0x5335E87930b410b8C5BB4D43c3360ACa15ec0C8C"],
  },
  linea: {
    issued: ["0x1E1F509963A6D33e169D9497b11c7DbFe73B7F13"],
  },
  arbitrum: {
    issued: ["0xb1084db8D3C05CEbd5FA9335dF95EE4b8a0edc30"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;