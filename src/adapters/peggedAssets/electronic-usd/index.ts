const chainContracts = {
  ethereum: {
    issued: ["0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F"],
  },
  base: {
    bridgedFromETH: ["0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4"],
  },
  arbitrum: {
    bridgedFromETH: ["0x12275DCB9048680c4Be40942eA4D92c74C63b844"],
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
