import { sumSingleBalance } from "../helper/generalUtil";
const sdk = require("@defillama/sdk");
import { addChainExports } from "../helper/getSupply";
import {
  PeggedIssuanceAdapter,
  ChainBlocks,
  Balances,
} from "../peggedAsset.type";
import getLogs from "@defillama/sdk/build/util/logs";

const DOLA = "0x865377367054516e17014CcdED1e7d814EDC9ce4";
const firmStart = 16159015;
const DBR = '0xAD038Eb671c44b853887A7E32528FaB35dC5D710';

async function ethereumUnreleased() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const logs = await getLogs({
      target: DBR,
      topics: ['0xc3dfb88ee5301cecf05761fb2728064e5b641524346ae69b9ba80394631bf11f'],
      fromBlock: firmStart,
      toBlock: _ethBlock,
      eventAbi: "event AddMarket(address market)",      
    });
    // unique markets
    const markets: string[] = [...new Set(logs.map(i => i.args.market))];
    // anDOLA + FiRM markets sitting liquidity
    const owners = ["0x7Fcb7DAC61eE35b3D4a51117A7c58D53f0a8a670", ...markets];

    for (let owner of owners) {
      const balance = (
        await sdk.api.erc20.balanceOf({
          target: DOLA,
          owner,
          block: _chainBlocks?.["ethereum"],
          chain: "ethereum",
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", Number(balance) / 10 ** 18, "unreleased", false);
    }
    return balances;
  };
}

const chainContracts = {
  ethereum: {
    issued: DOLA,
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
  blast: {
    bridgedFromETH: "0x8e38179D361402f6a94767757e807146609E9B3d",
  },
  mode: {
    bridgedFromETH: "0x00eA4344e90c741560f08667961A8dE39FF506D7",
  },
};
const chainExports = addChainExports(chainContracts);
const adapter: PeggedIssuanceAdapter = {
  ...chainExports,
  ethereum: {
    ...chainExports.ethereum,
    unreleased: ethereumUnreleased(),
  },
};

export default adapter;
