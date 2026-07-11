const chainContracts = {
  solana: {
    issued: ["usdsfJbX78ktZUnoRC7dwvvQz7xH3WdkpGne76gdUia"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
