const chainContracts = {
  tron: {
    issued: ["TXZo12qvnEVKvU2zbfuQeMXKusWyxonwEG"],
  },
  ethereum: {
    issued: ["0xe820c06321e60d36257c666643fa5436643445e3"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
