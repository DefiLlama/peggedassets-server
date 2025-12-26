const chainContracts = {
  // Align the chain name in https://unpkg.com/@defillama/sdk@5.0.195/build/providers.json
  mantrachain: {
    issued: ["0xd2b95283011E47257917770D28Bb3EE44c849f6F"],
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
