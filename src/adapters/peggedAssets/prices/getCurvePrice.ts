const sdk = require("@defillama/sdk");
import curveabi from "./curve_abi.json";
import BigNumber from "bignumber.js";
import { PriceSource } from "../../../peggedData/types";
import getCurrentPeggedPrice from ".";

export type OtherTokenTypes = "3crv" | "2crv" | "am3crv";

const threePool = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"; // ethereum
const amThreePool = "0x445FE580eF8d70FF569aB36e80c647af338db351"; // polygon
const twoPool = "0x27E611FD27b276ACbd5Ffd632E5eAEBEC9761E40"; // fantom

const baseDecimals = 7; // Low values give inaccurate prices, high values increase slippage. If baseDecimals > 8 some calls will revert.

export async function getCurvePrice(
  chain: string,
  pool: string,
  tokenIndex: 0 | 1,
  decimalsToken0: number,
  decimalsToken1: number,
  otherTokenisType?: OtherTokenTypes,
  use256abi?: boolean,
  baseDecimalsAdjustment?: number,
  otherTokenGeckoID?: string,
  otherTokenPriceSource?: PriceSource
) {
  let abi = {} as any;
  abi = use256abi ? curveabi["get_dy_256"] : curveabi["get_dy"];

  const adjustedBaseDecimals = baseDecimals + (baseDecimalsAdjustment ?? 0);

  // I don't understand the logic I used here, I just guessed until it worked.
  let decimalsPower = new BigNumber(10).pow(
    adjustedBaseDecimals + Math.max(0, decimalsToken0 - decimalsToken1)
  );
  let decimalsPowerCorrection = new BigNumber(10).pow(
    adjustedBaseDecimals + Math.max(0, decimalsToken1 - decimalsToken0)
  );

  const dy = (
    await sdk.api.abi.call({
      abi: abi,
      params: [0, 1, decimalsPower.toString()],
      target: pool,
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
            chain: "polygon",
          })
        ).output /
        10 ** 18;

      return price3crv * price.toNumber();
    }
  }

  if (otherTokenGeckoID && otherTokenPriceSource) {
    const otherTokenPrice = await getCurrentPeggedPrice(
      otherTokenGeckoID,
      otherTokenPriceSource
    );
    if (otherTokenPrice) {
      return price.toNumber() * otherTokenPrice;
    } else {
      throw new Error(
        `Could not price token in Curve pool ${pool}. Unable to get price for paired token ${otherTokenGeckoID}.`
      );
    }
  }

  return price.toNumber();
}
