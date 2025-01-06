const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
  fraxtal: {
    issued: "0x788D96f655735f52c676A133f4dFC53cEC614d4A",
    amoManager: "0x49a0c8030Ca199f6F246517aE689E3cC0775271a",
    issuer: "0x1ec13EF0b22C53298A00b23b03203E03D999b7a2",
  },
};

async function dUSDMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks,
  ) {
    let balances = {} as Balances;
    const circulatingSupply = (
      await sdk.api.abi.call({
        abi: {
          inputs: [],
          name: "circulatingDusd",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        target: chainContracts[chain as keyof typeof chainContracts].issuer,
        chain: chain,
        block: _chainBlocks?.[chain],
      })
    ).output;

    const amoSupply = (
      await sdk.api.abi.call({
        abi: {
          inputs: [],
          name: "totalAmoSupply",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        target: chainContracts[chain as keyof typeof chainContracts].amoManager,
        chain: chain,
        block: _chainBlocks?.[chain],
      })
    ).output;


    sumSingleBalance(
      balances,
      "peggedUSD",
      Number((BigInt(circulatingSupply) + BigInt(amoSupply))/ BigInt(10 ** decimals)),
      "issued",
      false,
    );

    return balances;
  };
}

async function dUSDUnreleased(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks,
  ) {
    let balances = {} as Balances;

    const amoSupply = (
      await sdk.api.abi.call({
        abi: {
          inputs: [],
          name: "totalAmoSupply",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        target: chainContracts[chain as keyof typeof chainContracts].amoManager,
        chain: chain,
        block: _chainBlocks?.[chain],
      })
    ).output;

    sumSingleBalance(
      balances,
      "peggedUSD",
      Number(BigInt(amoSupply) / BigInt(10 ** decimals)),
      "issued",
      false,
    );

    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  fraxtal: {
    minted: dUSDMinted("fraxtal", 6),
    unreleased: dUSDUnreleased("fraxtal", 6),
  },
};

export default adapter;
