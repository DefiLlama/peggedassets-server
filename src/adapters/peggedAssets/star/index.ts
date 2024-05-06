const chainContracts = {
  arbitrum: {
    issued: ["0xC19669A405067927865B40Ea045a2baabbbe57f5"],
  },
  polygon: {
    issued: ["0xC19669A405067927865B40Ea045a2baabbbe57f5"],
  },
  base: {
    issued: ["0xC19669A405067927865B40Ea045a2baabbbe57f5"],
  },
}

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;