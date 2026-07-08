const chainContracts = {
  ethereum: {
    issued: ["0x98A878b1Cd98131B271883B390f68D2c90674665"],
  },
  base: {
    issued: ["0xd993935e13851dd7517af10687ec7e5022127228"],
  },
  bsc: {
    issued: ["0x6b3788fd6604bbf03c5378d24e57bb334baad4af"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
