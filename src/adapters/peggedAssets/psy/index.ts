const chainContracts = {
  arbitrum: {
    issued: "0x63d4dc5376cfb48a885a165cd97ba208b87881c7",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;