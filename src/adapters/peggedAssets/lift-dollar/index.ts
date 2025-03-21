const chainContracts = {
  ethereum: {
    issued: ["0xbdC7c08592Ee4aa51D06C27Ee23D5087D65aDbcD"],
  },
  arbitrum: {
    issued: ["0x7F850b0aB1988Dd17B69aC564c1E2857949e4dEe"]
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;