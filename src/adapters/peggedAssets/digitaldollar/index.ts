const chainContracts = {
  arbitrum: {
    issued: ["0xF0B5cEeFc89684889e5F7e0A7775Bd100FcD3709"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
