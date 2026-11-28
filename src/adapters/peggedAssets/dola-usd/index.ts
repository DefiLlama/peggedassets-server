import { ChainApi } from "@defillama/sdk";
import { addChainExports } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";

const DOLA = "0x865377367054516e17014CcdED1e7d814EDC9ce4";
const DBR = "0xAD038Eb671c44b853887A7E32528FaB35dC5D710";
const AN_DOLA = "0x7Fcb7DAC61eE35b3D4a51117A7c58D53f0a8a670";
const FIRM_START_BLOCK = 16159015;
const DECIMALS = 18;

const chainContracts = {
  ethereum: {
    issued: [DOLA],
  },
  fantom: {
    bridgedFromETH: ["0x3129662808bEC728a27Ab6a6b9AFd3cBacA8A43c"],
  },
  optimism: {
    bridgedFromETH: ["0x8aE125E8653821E851F12A49F7765db9a9ce7384"],
  },
  bsc: {
    bridgedFromETH: ["0x2f29bc0ffaf9bff337b31cbe6cb5fb3bf12e5840"],
  },
  arbitrum: {
    bridgedFromETH: ["0x6a7661795c374c0bfc635934efaddff3a7ee23b6"],
  },
  polygon: {
    bridgedFromETH: ["0xbc2b48bc930ddc4e5cfb2e87a45c379aab3aac5c"],
    bridge: "polygon",
  },
  avax: {
    bridgedFromETH: ["0x221743dc9e954be4f86844649bf19b43d6f8366d"],
    bridge: "multichain",
  },
  base: {
    bridgedFromETH: ["0x4621b7A9c75199271F773Ebd9A499dbd165c3191"],
    bridge: "base",
  },
};

async function ethereumUnreleased(api: ChainApi) {
  const currentBlock = await api.getBlock();
  const logs =
    currentBlock >= FIRM_START_BLOCK
      ? await api.getLogs({
          target: DBR,
          eventAbi: "event AddMarket(address indexed market)",
          fromBlock: FIRM_START_BLOCK,
          toBlock: currentBlock,
          onlyArgs: true,
        })
      : [];

  const markets = logs.map((l: any) => String(l.market).toLowerCase());
  const owners = [...new Set([AN_DOLA.toLowerCase(), ...markets])];
  const rawBalances = await api.multiCall({
    target: DOLA,
    abi: "erc20:balanceOf",
    calls: owners,
  });

  let total = BigInt(0);
  for (const b of rawBalances) total += BigInt(b);

  const balances = {} as Balances;
  sumSingleBalance(balances, "peggedUSD", Number(total) / 10 ** DECIMALS);
  return balances;
}

const adapter: PeggedIssuanceAdapter = addChainExports(chainContracts, undefined, {
  pegType: "peggedUSD",
});
adapter.ethereum.unreleased = ethereumUnreleased;

export default adapter;
