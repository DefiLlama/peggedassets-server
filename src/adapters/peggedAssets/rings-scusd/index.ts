
const chainContracts = {
  sonic: {
    issued: ["0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE"],
  },
}; // flagged as double counted since the tokens used on Ethereum to ming scUSD on Sonic remain on Ethereum used in various defi projects via the veda boringvault

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;