import { addChainExports } from "../helper/getSupply";

const chainContracts = {
  ethereum: {
    issued: ["0x1676b80edd36b18a3c3432c11ed25d37fde9c92a"],
  },
  bsc: {
    issued: ["0x1676b80edd36b18a3c3432c11ed25d37fde9c92a"],
  },
};

const adapter = addChainExports(chainContracts);
export default adapter;
