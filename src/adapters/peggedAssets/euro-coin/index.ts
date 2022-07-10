const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x1abaea1f7c830bd89acc67ec4af516284b1bc33c"],
    unreleased: ["0x55fe002aeff02f77364de339a1292923a15844b8"],
  },
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
          block: _chainBlocks[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedEUR",
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
          block: _chainBlocks[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedEUR", reserve / 10 ** decimals);
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
};

export default adapter;
