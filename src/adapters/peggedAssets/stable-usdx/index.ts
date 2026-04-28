const chainContracts = {
  solana: {
    issued: "9Gst2E7KovZ9jwecyGqnnhpG1mhHKdyLpJQnZonkCFhA",
  },
  ethereum: {
    issued: "0xfea577f08d1984e6654813be0acee3140e5d7d42",
  },
  monad: {
    issued: "0xd0a4BDb0422DB3fA77dC46189b6d043D2cd5A7B9",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
