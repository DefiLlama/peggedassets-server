const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { solanaMintedOrBridged } from "../helper/getSupply";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,  ChainContracts,
} from "../peggedAsset.type";
import { getTotalSupply as tezosGetTotalSupply } from "../helper/tezos";
import { getTotalSupply as stellarGetTotalSupply } from "../helper/stellar";


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x6ba75d640bebfe5da1197bb5a2aff3327789b5d3"],
  },
  polygon: {
    issued: ["0xE4095d9372E68d108225c306A4491cacfB33B097"],
  },
  avax: {
    issued: ["0x7678e162f38ec9ef2bfd1d0aaf9fd93355e5fa0b"],
  },
  solana: {
    issued: ["C4Kkr9NZU3VbyedcgutU6LKmi6MKz81sx6gRmk5pX519"],
  },
  q: {
    issued: ["0x513f99dee650f529d7c65bb5679f092b64003520"],
  },
  tezos: {
    issued: ["KT1FenS7BCUjn1otfFyfrfxguiGnL4UTF3aG"],
  },
  stellar: {
    issued: ["VEUR:GDXLSLCOPPHTWOQXLLKSVN4VN3G67WD2ENU7UMVAROEYVJLSPSEWXIZN"],
  },
  base: {
    issued: ["0x4ed9Df25d38795a47f52614126e47f564D37F347"],
  },
  celo: {
    issued: ["0x9346f43c1588b6df1d52bdd6bf846064f92d9cba"],
  },
  fraxtal: {
    issued: ["0x4c0bd74da8237c08840984fdb33a84b4586aaee6"],
  },
  arbitrum: {
    issued: ["0x4883C8f0529F37e40eBeA870F3C13cDfAD5d01f8"],
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
        "peggedEUR",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

async function tezosMinted(contract: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await tezosGetTotalSupply(contract);
    sumSingleBalance(balances, "peggedEUR", totalSupply, "issued", false);
    return balances;
  };
}

async function stellarMinted(assetID: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await stellarGetTotalSupply(assetID);
    sumSingleBalance(balances, "peggedEUR", totalSupply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
  },
  polygon: {
    minted: chainMinted("polygon", 18),
  },
  avax: {
    minted: chainMinted("avax", 18),
  },
  q: {
    minted: chainMinted("q", 18),
  },
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued, "peggedEUR"),
  },
  tezos: {
    minted: tezosMinted(chainContracts.tezos.issued[0]),
  },
  stellar: {
    minted: stellarMinted(chainContracts.stellar.issued[0]),
  },
  base: {
    minted: chainMinted("base", 18),
  },
  celo: {
    minted: chainMinted("celo", 18),
  },
  fraxtal: {
    minted: chainMinted("fraxtal", 18),
  },
  arbitrum: {
    minted: chainMinted("arbitrum", 18),
  },
};

export default adapter;
