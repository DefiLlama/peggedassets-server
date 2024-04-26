import { addChainExports, } from "../helper/getSupply";
import {
  ChainContracts,
} from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xbc6da0fe9ad5f3b0d58160288917aa56653660e9"],
    unreleased: ["0x9735f7d3ea56b454b24ffd74c58e9bd85cfad31b"], // AMO
  },
  arbitrum: {
    bridgedFromETH: ["0x2130d2a1e51112D349cCF78D2a1EE65843ba36e0"], // multichain
  },
  optimism: {
    bridgedFromETH: [
      "0xb2c22A9fb4FC02eb9D1d337655Ce079a04a526C7", // multichain
      "0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A", // also multichain?
    ],
  },
  fantom: {
    bridgedFromETH: ["0xB67FA6deFCe4042070Eb1ae1511Dcd6dcc6a532E"], // has more than in multichain bridge contract
  },
};

const adapter = addChainExports(chainContracts);
export default adapter;
