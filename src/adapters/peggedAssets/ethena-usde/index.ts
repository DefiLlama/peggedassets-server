const chainContracts = {
  ethereum: {
    issued: ["0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"],
  },
  mantle: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  blast: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  arbitrum: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  optimism: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  base: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  era: {
    bridgedFromETH: "0x39Fe7a0DACcE31Bd90418e3e659fb0b5f0B3Db0d",
  },
  bsc: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  linea: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  manta: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  scroll: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  fraxtal: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  mode: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  metis: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  kava: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  xlayer: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  solana: {
    issued: ["HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr"],
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;