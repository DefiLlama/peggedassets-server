
const chainContracts = {
  ethereum: {
    issued: ["0x1cfa5641c01406ab8ac350ded7d735ec41298372"], pegType: 'peggedJPY'
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter