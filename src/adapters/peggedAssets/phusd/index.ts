const chainContracts = {
  ethereum: {
    issued: ["0xf3B5B661b92B75C71fA5Aba8Fd95D7514A9CD605"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
