const chainContracts = {
  pulse: {
    issued: ["0xeB6b7932Da20c6D7B3a899D5887d86dfB09A6408"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;