import { addChainExports } from "../helper/getSupply";

const chainContracts = {
  ethereum: {
    issued: ["0xa1fA7777974312f7d801A8880714a218F76233f8"], // USDx V2
  },
};

export default addChainExports(chainContracts);
