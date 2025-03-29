const sdk = require("@defillama/sdk");
import {
  sumSingleBalance,
} from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
  ChainContracts,
} from "../peggedAsset.type";



const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
    unreleased: ["0x7c62Bb89ABb22a6bA8668bEE8ddEC416bD402492"], // bridge locker
  },
  arbitrum: {
    issued: ["0xaf88d065e77c8cc2239327c5edb3a432268e5831"],
    unreleased: ["0x7c62Bb89ABb22a6bA8668bEE8ddEC416bD402492"], // bridge locker
  },
  xdc: {
    issued: ["0x2A8E898b6242355c290E1f4Fc966b8788729A4D4"], // USDC.e
  }
};

async function bridgedFrom(chainId: number, decimals: number) {
  return async function (
      _timestamp: number,
      _ethBlock: number,
      _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const bridged = (
        await sdk.api.abi.call({
          abi: "function lockedOn(uint24 chainId) public view returns (uint256)",
          target: "0x7a0182d8C3D6F52F615FF8bCbbEed66436281De4", // minter contract
          params: [chainId.toString()],
          block: _chainBlocks?.["xdc"],
          chain: "xdc",
        })
    ).output;
    sumSingleBalance(balances, "peggedUSD", bridged / 10 ** decimals, "bridged");
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
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedUSD",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}


async function chainUnreleased(chain: string, decimals: number, owner: string) {
  return async function (
      _timestamp: number,
      _ethBlock: number,
      _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const reserve = (
          await sdk.api.erc20.balanceOf({
            target: issued,
            owner: owner,
            block: _chainBlocks?.[chain],
            chain: chain,
          })
      ).output;
      sumSingleBalance(balances, "peggedUSD", reserve / 10 ** decimals);
    }
    return balances;
  };
}


const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 6),
    unreleased: chainUnreleased(
        "ethereum",
        6,
        chainContracts.ethereum.unreleased[0]
    ),
  },
  arbitrum: {
    minted: chainMinted("arbitrum", 6),
    unreleased: chainUnreleased(
        "arbitrum",
        6,
        chainContracts.arbitrum.unreleased[0]
    ),
  },
  xdc: {
    minted: chainMinted("xdc", 6),
    arbitrum: bridgedFrom(42161, 6),
    ethereum: bridgedFrom(1, 6),
  },
};

export default adapter;
