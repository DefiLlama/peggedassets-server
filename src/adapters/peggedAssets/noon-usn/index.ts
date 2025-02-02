const sdk = require("@defillama/sdk");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";

const chainContracts : ChainContracts = {
  ethereum: {
    
    issued: ["0xdA67B4284609d2d48e5d10cfAc411572727dc1eD"],

  },
  era: {
    issued: ["0x0469d9d1dE0ee58fA1153ef00836B9BbCb84c0B6"]
  }
};

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
      console.log(totalSupply)
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

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
  },
  era: {
    minted: chainMinted("era", 18),
  },
};

export default adapter;
