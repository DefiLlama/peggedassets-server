const chainContracts = {
  ethereum: {
    issued: [
      "0x65D72AA8DA931F047169112fcf34f52DbaAE7D18",
      "0x9216272158F563488FfC36AFB877acA2F265C560",
      "0x50B4DC15b34E31671c9cA40F9eb05D7eBd6b13f9",
    ],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;