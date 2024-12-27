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
  },
};

async function dUSDMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks,
  ) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts[chain as keyof typeof chainContracts].issued,
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

    const circulatingSupply = BigInt(totalSupply) - BigInt(amoSupply);

    sumSingleBalance(
      balances,
      "peggedUSD",
      Number(circulatingSupply / BigInt(10 ** decimals)),
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

    const amoVaults = (
      await sdk.api.abi.call({
        abi: {
          inputs: [],
          name: "amoVaults",
          outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
          stateMutability: "view",
          type: "function",
        },
        target: chainContracts[chain as keyof typeof chainContracts].amoManager,
        chain: chain,
        block: _chainBlocks?.[chain],
      })
    ).output;

    let totalUnreleased = 0n;
    for (const vault of amoVaults) {
      const vaultDusd = (
        await sdk.api.abi.call({
          abi: {
            inputs: [],
            name: "totalDusdValue",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          target: vault,
          chain: chain,
          block: _chainBlocks?.[chain],
        })
      ).output;
      totalUnreleased += BigInt(vaultDusd);
    }

    sumSingleBalance(
      balances,
      "peggedUSD",
      Number(totalUnreleased / BigInt(10 ** decimals)),
      "unreleased",
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
