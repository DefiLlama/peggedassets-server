const chainContracts = {
  ethereum: {
    issued: ["0x5f98805a4e8be255a32880fdec7f6728c6568ba0"],
  },
  polygon: {
    bridgedFromETH: ["0x23001f892c0C82b79303EDC9B9033cD190BB21c7"],
  },
  optimism: {
    bridgedFromETH: ["0xc40F949F8a4e094D1b49a23ea9241D289B7b2819"],
  },
  bsc: {
    bridgedFromETH: ["0x181002D60d504d30a39601Ae13Af3191cb102580"], // celer
  },
  avax: {
    bridgedFromETH: ["0xDA0019E7e50Ee4990440b1aa5dFFCAC6E27Ee27B"], // celer
  },
  fantom: {
    bridgedFromETH: ["0x16365b45EB269B5B5dACB34B4a15399Ec79b95eB"], // celer
  },
  arbitrum: {
    bridgedFromETH: ["0x93b346b6BC2548dA6A1E7d98E9a421B42541425b"],
  },
  polygon_zkevm: {
    bridgedFromETH: ["0x01E9A866c361eAd20Ab4e838287DD464dc67A50e"],
  },
  era: {
    bridgeOnETH: ["0x32400084C286CF3E17e7B677ea9583e60a000324"],
    bridgedFromETH: ["0x503234f203fc7eb888eec8513210612a43cf6115"],
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;