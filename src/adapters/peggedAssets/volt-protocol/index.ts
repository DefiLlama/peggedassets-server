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
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x559eBC30b0E58a45Cc9fF573f77EF1e5eb1b3E18"],
    // may not be fully accurate, need to revisit and cross-reference with Dune: dune.com/funky/Volt
    reserves: [
      "0x42ea9cc945fca2dffd0bebb7e9b3022f134d9bdd", // psm
      "0xfebdf448c8484834bb399d930d7e1bdc773e23ba",
      "0xd51dba7a94e1adea403553a8235c302cebf41a3c",
      "0x985f9c331a9e4447c782b98d6693f5c7df8e560e",
      "0x0b9a7ea2fca868c93640dd77cf44df335095f501",
      "0xcbb83206698e8788f85efbeeecad17e53366ebdf",
    ],
  },
  arbitrum: {
    bridgedFromETH: ["0x6Ba6f18a290Cd55cf1B00be2bEc5c954cb29fAc5"],
    reserves: [
      "0x4d2cf840fde4210a96f485fc01f1459bfb2efabb", // psm
      "0x278a903da9fb0ea8b90c2b1b089ef90033fdd868", // psm
    ],
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
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedVAR",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

async function chainUnreleased(
  chain: string,
  decimals: number,
  target: string,
  owners: string[]
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let owner of owners) {
      const reserve = (
        await sdk.api.erc20.balanceOf({
          target: target,
          owner: owner,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedVAR", reserve / 10 ** decimals);
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: chainUnreleased(
      "ethereum",
      18,
      chainContracts.ethereum.issued[0],
      chainContracts.ethereum.reserves
    ),
  },
  arbitrum: {
    minted: async () => ({}),
    unreleased: chainUnreleased(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromETH[0],
      chainContracts.arbitrum.reserves
    ),
    ethereum: bridgedSupply(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromETH,
      undefined,
      undefined,
      "peggedVAR"
    ),
  },
};

export default adapter;
