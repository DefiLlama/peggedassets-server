const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
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
    issued: "0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef",
    unreleased: [],
  },
  polygon: {
    issued: "0x9de41aFF9f55219D5bf4359F167d1D0c772A396D",
    unreleased: [],
  },
  arbitrum: {
    issued: "0x2b28E826b55e399F4d4699b85f68666AC51e6f70",
    unreleased: [],
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
      "peggedCAD",
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
        "peggedCAD",
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
    arbitrum: {
        minted: chainMinted("arbitrum", 18),
        unreleased: async () => ({}),
      },
  };
  
export default adapter;