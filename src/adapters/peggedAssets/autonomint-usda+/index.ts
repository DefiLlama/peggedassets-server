const chainContracts = {
  base: {
    issued: "0x4e44fB5c61a89CF44a9080AB987335889FCaA6bd",
  },
  optimism: {
    issued: "0x4e44fB5c61a89CF44a9080AB987335889FCaA6bd",
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;