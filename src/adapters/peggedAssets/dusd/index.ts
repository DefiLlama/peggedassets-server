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
    amoManager: "0xd9Ba545656Cba566C042F96634749242a3bF76c7",
  },
};

async function dUSDMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks,
  ) {
    let balances = {} as Balances;
    // Get total supply from the token contract
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts[chain as keyof typeof chainContracts].issued,
        chain: chain,
        block: _chainBlocks?.[chain],
      })
    ).output;

    // Get AMO supply from AMO manager contract
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

    // Calculate actual circulating supply by subtracting AMO supply
    const circulatingSupply = totalSupply - amoSupply;

    sumSingleBalance(
      balances,
      "peggedUSD",
      circulatingSupply / 10 ** decimals,
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

    // Get list of AMO vaults
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

    // Get DUSD value from each vault and sum them up
    let totalUnreleased = 0;
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
      totalUnreleased += Number(vaultDusd);
    }

    sumSingleBalance(
      balances,
      "peggedUSD",
      totalUnreleased / 10 ** decimals,
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
