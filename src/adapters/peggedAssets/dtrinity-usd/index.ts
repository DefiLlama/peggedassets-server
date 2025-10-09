const chainContracts = {
  fraxtal: {
    issued: "0x788D96f655735f52c676A133f4dFC53cEC614d4A",
  },
  sonic: {
    issued: "0x53a6aBb52B2F968fA80dF6A894e4f1b1020DA975",
  },
  ronin: {
    issued: "0x0043a403ada6b63045112d7e979a057c82714fe7",
  },
  katana: {
    issued: "0xcA52d08737E6Af8763a2bF6034B3B03868f24DDA",
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
