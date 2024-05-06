const chainContracts = {
  polygon: {
    issued: [
      "0x80487b4f8f70e793a81a42367c225ee0b94315df",
      "0x5D066D022EDE10eFa2717eD3D79f22F949F8C175",
    ],
  },
}

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;