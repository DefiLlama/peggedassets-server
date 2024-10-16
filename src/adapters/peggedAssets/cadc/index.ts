
const pegType = "peggedCAD";

const chainContracts = {
  ethereum: {
    issued: "0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef", pegType
  },
  polygon: {
    issued: "0x9de41aFF9f55219D5bf4359F167d1D0c772A396D", pegType
  },
  arbitrum: {
    issued: "0x2b28E826b55e399F4d4699b85f68666AC51e6f70", pegType
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType});
export default adapter;