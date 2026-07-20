// JPYSC - trust-type Japanese Yen stablecoin issued by SBI Shinsei Trust & Banking
// under Japan's Electronic Payment Instruments framework (trust-type).
// Fully backed; circulating supply equals on-chain totalSupply.
const chainContracts = {
  ethereum: {
    issued: ["0x6781d5631bfe47432b089e64e3eab3b6edd26177"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, {
  pegType: "peggedJPY",
});
export default adapter;
