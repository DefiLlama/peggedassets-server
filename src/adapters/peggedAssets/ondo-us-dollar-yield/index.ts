const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";


type ChainContracts = {
  [chain: string]: {
    issued: string;
    unreleased: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: "0x96F6eF951840721AdBF46Ac996b59E0235CB985C",
    unreleased: []
  },
  polygon: {
    issued: "0x96F6eF951840721AdBF46Ac996b59E0235CB985C",
    unreleased: []
  },
  mantle: {
    issued: "0x5bE26527e817998A7206475496fDE1E68957c5A6",
    unreleased: ["0x94FEC56BBEcEaCC71c9e61623ACE9F8e1B1cf473"]
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts[chain].issued,
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
    return balances;
  };
}

async function chainUnreleased(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let unreleased of chainContracts[chain].unreleased) {
      const unreleasedBalance = (
        await sdk.api.abi.call({
          abi: "erc20:balanceOf",
          target: chainContracts[chain].issued,
          params: [unreleased],
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedUSD",
        unreleasedBalance / 10 ** decimals,
        "unreleased",
        false
      );
    }
    return balances;
  };
}


const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
  },
  polygon: {
    minted: chainMinted("polygon", 18),
    unreleased: async () => ({}),
  },
  mantle: {
    minted: chainMinted("mantle", 18),
    unreleased: chainUnreleased("mantle", 18),
  },
};

export default adapter;