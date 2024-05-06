
const chainContracts = {
  ethereum: {
    issued: [
      "0x9D11ab23d33aD026C466CE3c124928fDb69Ba20E",
      "0x576b4779727F5998577bb4e25bf726abE742b9F7",
    ],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;