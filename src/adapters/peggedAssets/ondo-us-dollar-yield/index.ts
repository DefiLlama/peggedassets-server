const chainContracts = {
  ethereum: {
    issued: "0x96F6eF951840721AdBF46Ac996b59E0235CB985C",
  },
  polygon: {
    issued: "0x96F6eF951840721AdBF46Ac996b59E0235CB985C",
  },
  mantle: {
    issued: "0x5bE26527e817998A7206475496fDE1E68957c5A6",
    unreleased: ["0x94FEC56BBEcEaCC71c9e61623ACE9F8e1B1cf473"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;