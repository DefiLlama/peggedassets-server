import { addChainExports } from "../helper/getSupply";
import {
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
  ethereum: {
    issued: "0x865377367054516e17014CcdED1e7d814EDC9ce4",
  },
  fantom: {
    bridgedFromETH: "0x3129662808bEC728a27Ab6a6b9AFd3cBacA8A43c", // multichain
  },
  optimism: {
    bridgedFromETH: "0x8aE125E8653821E851F12A49F7765db9a9ce7384",
  },
  bsc: {
    bridgedFromETH: "0x2f29bc0ffaf9bff337b31cbe6cb5fb3bf12e5840",
  },
  arbitrum: {
    bridgedFromETH: "0x6a7661795c374c0bfc635934efaddff3a7ee23b6",
  },
  polygon: {
    bridgedFromETH: "0xbc2b48bc930ddc4e5cfb2e87a45c379aab3aac5c",
  },
  avax: {
    bridgedFromETH: "0x221743dc9e954be4f86844649bf19b43d6f8366d",
  },
  base: {
    bridgedFromETH: "0x4621b7A9c75199271F773Ebd9A499dbd165c3191",
  },
};

const adapter: PeggedIssuanceAdapter = addChainExports(chainContracts);

export default adapter;
