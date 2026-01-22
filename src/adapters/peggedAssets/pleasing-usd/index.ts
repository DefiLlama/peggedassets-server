const chainContracts = {
  arbitrum: {
    issued: ["0xc8fb643d18f1e53698cfda5c8fdf0cdc03c1dbec"],
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
