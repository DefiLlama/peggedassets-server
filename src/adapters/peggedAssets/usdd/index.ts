const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";
import {
  getTotalSupply as tronGetTotalSupply, // NOTE THIS DEPENDENCY
} from "../helper/tron";


const chainContracts: ChainContracts = {
  tron: {
    issued: ["TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz"],
  },
  bittorrent: {
    bridgedFromTron: ["0x42f9db3e95f91b414f4a321122e2804Ab75778d9"],
  },
  ethereum: {
    issued: ["0x4f8e5DE400DE08B164E7421B3EE387f461beCD1A"],
    bridgedFromBttc: ["0x3D7975EcCFc61a2102b08925CbBa0a4D4dBB6555"],
    reserves: ["0x9277a463A508F45115FdEaf22FfeDA1B16352433"],
    savings: ["0xFf77F6209239DEB2c076179499f2346b0032097f", "0xE789578252Cc026FfB3413a1104bA223fDeca500"],
  },
  bsc: {
    issued: ["0x45E51bc23D592EB2DBA86da3985299f7895d66Ba"],
    bridgedFromBttc: ["0x392004BEe213F1FF580C867359C246924f21E6Ad"],
    reserves: ["0xCa266910d92a313E5F9eb1AfFC462bcbb7d9c4A9"],
    savings: ["0x41F1402ab4d900115D1f16a14A3cF4BDF2F2705C", "0xF0c506e48383C1925c025ec9f4A9e1Dd94FF8b18"],
  },
};

async function tronMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await tronGetTotalSupply(
      chainContracts["tron"].issued[0]
    );
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

async function ethereumBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;

    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.ethereum.bridgedFromBttc[0],
        block: _chainBlocks?.["ethereum"],
        chain: "ethereum",
      })
    ).output;

    const reserve = (
      await sdk.api.erc20.balanceOf({
        target: chainContracts.ethereum.bridgedFromBttc[0],
        owner: chainContracts.ethereum.reserves[0], // reserve contract for USDD on Ethereum
        block: _chainBlocks?.["ethereum"],
        chain: "ethereum",
      })
    ).output;

    sumSingleBalance(
      balances,
      "peggedUSD",
      (totalSupply - reserve) / 10 ** 18,
      chainContracts.ethereum.reserves[0],
      true
    );
    return balances;
  };
}

async function bscBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;

    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.bsc.bridgedFromBttc[0],
        block: _chainBlocks?.["bsc"],
        chain: "bsc",
      })
    ).output;

    const reserve = (
      await sdk.api.erc20.balanceOf({
        target: chainContracts.bsc.bridgedFromBttc[0],
        owner: chainContracts.bsc.reserves[0], // reserve contract for USDD on BSC
        block: _chainBlocks?.["bsc"],
        chain: "bsc",
      })
    ).output;

    sumSingleBalance(
      balances,
      "peggedUSD",
      (totalSupply - reserve) / 10 ** 18,
      chainContracts.bsc.reserves[0],
      true
    );
    return balances;
  };
}

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    let totalSupply = 0;
    let dsr = 0;
    for (const [key, contractsArr] of Object.entries(chainContracts[chain])) {
      if (key === "issued") {
        let issued = contractsArr[0];
        totalSupply = (
          await sdk.api.abi.call({
            abi: "erc20:totalSupply",
            target: issued,
            block: _chainBlocks?.[chain],
            chain: chain,
          })
        ).output;
      }
      if (key === "savings") {
        let vat = contractsArr[0];
        let pot = contractsArr[1];
        dsr = (
          await sdk.api.abi.call({
            abi: {
              constant: true,
              inputs: [{ internalType: "address", name: "", type: "address" }],
              name: "usdd",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
            target: vat,
            block: _chainBlocks?.[chain],
            chain: chain,
            params: [pot],
          })
        ).output;
      }
    }
    sumSingleBalance(
      balances,
      "peggedUSD",
      (Number(totalSupply) + Number(dsr) / 1e27) / 10 ** decimals,
      "issued",
      false
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  tron: {
    minted: tronMinted(),
  },
  bittorrent: {
    tron: bridgedSupply(
      "bittorrent",
      18,
      chainContracts.bittorrent.bridgedFromTron
    ),
  },
  ethereum: {
    minted: chainMinted("ethereum", 18),
    bittorrent: ethereumBridged(),
  },
  bsc: {
    minted: chainMinted("bsc", 18),
    bittorrent: bscBridged(),
  },
};

export default adapter;
