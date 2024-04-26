const chainContracts = {
  fantom: {
    issued: ["0xad84341756bf337f5a0164515b1f6f993d194e1f"],
    unreleased: [
      // the fUSD situation is not very transparent. the following 2 are the largest holders of fUSD.
      // some discussion on the 0x431e8 wallet can be found - https://twitter.com/bantg/status/1453322161540718594
      "0x431e81e5dfb5a24541b5ff8762bdef3f32f96354", // alleged fantom foundation EOA, could be Andre Cronje or yearn x abracadra
      "0x9c8aef3a8792094aede3cd67f52296e21c801b81", // could be foundation gnosis safe. rather inactive
    ],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
