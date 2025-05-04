const chainContracts = 
{
  bevm: {
    issued: [
      "0xF2692468666E459D87052f68aE474E36C1a34fbB", // V1
      "0x2031c8848775a5EFB7cfF2A4EdBE3F04c50A1478", // V2
    ],
  },
  btr: {
    issued: [
      "0xa1e63CB2CE698CfD3c2Ac6704813e3b870FEDADf", // V1
      "0xba50dDac6B2F5482cA064EFAc621E0C7c0f6A783", // V2
    ],
  },
  bob: {
    issued: [
      "0x78Fea795cBFcC5fFD6Fb5B845a4f53d25C283bDB", // V1
      "0xecf21b335B41f9d5A89f6186A99c19a3c467871f", // V2
    ],
  },
  bsquared: {
    issued: [
      "0x62b4B8F5a03e40b9dAAf95c7A6214969406e28c3", // V1
      "0x8dD8b12d55C73c08294664a5915475eD1c8b1F6f", // V2
    ],
  },
  bsc: {
    issued: [
      "0xb4818BB69478730EF4e33Cc068dD94278e2766cB", // V2
    ],
  },
  hemi: {
    issued: [
      "0xb4818BB69478730EF4e33Cc068dD94278e2766cB", // V2
    ],
  },
  base: {
    issued: [
      "0x70654AaD8B7734dc319d0C3608ec7B32e03FA162", // V2
    ],
  },
  arbitrum: {
    issued: [
      "0xb4818BB69478730EF4e33Cc068dD94278e2766cB", // V2
    ],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
