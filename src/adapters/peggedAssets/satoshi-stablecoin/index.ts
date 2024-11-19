const chainContracts = 
{
  bevm: {
    issued: ["0xF2692468666E459D87052f68aE474E36C1a34fbB"],
  },
  btr: {
    issued: ["0xa1e63CB2CE698CfD3c2Ac6704813e3b870FEDADf"],
  },
  bob: {
    issued: ["0x78Fea795cBFcC5fFD6Fb5B845a4f53d25C283bDB"],
  },
  bsquared: {
    issued: ["0x62b4B8F5a03e40b9dAAf95c7A6214969406e28c3"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
