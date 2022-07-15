const sdk = require("@defillama/sdk");
import curveabi from "./curve_abi.json";
import BigNumber from "bignumber.js";
import { ChainBlocks } from "../peggedAsset.type";

export type OtherTokenTypes = "3crv" | "2crv" | "am3crv";

const threePool = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
const amThreePool = "0x445FE580eF8d70FF569aB36e80c647af338db351";
const twoPool = "0x27E611FD27b276ACbd5Ffd632E5eAEBEC9761E40";

const baseDecimals = 7; // Low values give inaccurate prices, high values increase slippage. If baseDecimals > 8 some calls will revert.

export async function getCurvePrice(
  chain: string,
  chainBlocks: ChainBlocks,
  pool: string,
  tokenIndex: 0 | 1,
  decimalsToken0: number,
  decimalsToken1: number,
  otherTokenisType?: OtherTokenTypes,
  use256abi?: boolean
) {
  let abi = {} as any;
  abi = use256abi ? curveabi["get_dy_256"] : curveabi["get_dy"];

  // I don't understand the logic I used here, I just guessed until it worked.
  let decimalsPower = new BigNumber(10).pow(
    baseDecimals + Math.max(0, decimalsToken0 - decimalsToken1)
  );
  let decimalsPowerCorrection = new BigNumber(10).pow(
    baseDecimals + Math.max(0, decimalsToken1 - decimalsToken0)
  );

  const dy = (
    await sdk.api.abi.call({
      abi: abi,
      params: [0, 1, decimalsPower.toString()],
      target: pool,
      block: chainBlocks[chain],
      chain: chain,
    })
  ).output;

  const price = tokenIndex
    ? decimalsPowerCorrection.div(dy)
    : decimalsPowerCorrection.pow(-1).multipliedBy(dy);

  if (otherTokenisType) {
    if (otherTokenisType === "3crv") {
      const price3crv =
        (
          await sdk.api.abi.call({
            abi: curveabi.get_virtual_price,
            target: threePool,
            block: chainBlocks["ethereum"],
            chain: "ethereum",
          })
        ).output /
        10 ** 18;

      return price3crv * price.toNumber();
    }

    if (otherTokenisType === "2crv") {
      const price2PoolToken =
        (
          await sdk.api.abi.call({
            abi: curveabi.get_virtual_price,
            target: twoPool,
            block: chainBlocks["fantom"],
            chain: "fantom",
          })
        ).output /
        10 ** 18;

      return price2PoolToken * price.toNumber();
    }

    if (otherTokenisType === "am3crv") {
      const price3crv =
        (
          await sdk.api.abi.call({
            abi: curveabi.get_virtual_price,
            target: amThreePool,
            block: chainBlocks["polygon"],
            chain: "polygon",
          })
        ).output /
        10 ** 18;

      return price3crv * price.toNumber();
    }
  }

  return price.toNumber();
}
