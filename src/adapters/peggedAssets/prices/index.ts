const axios = require("axios");

const PRICES_API = "https://coins.llama.fi/prices";

export async function getPrices(assets: any[]) {
  const mapping = {} as any;
  function getTokenAddress(token: any) {
    if (token.priceSource === "coingecko") {
      return 'coingecko:' + token.gecko_id;
    }
    let id = token.address
    if (id)
      return id.startsWith("0x") ? 'ethereum:' + id : id;
    return 'coingecko:' + token.gecko_id;
  }
  assets.forEach((token) => {
    mapping[getTokenAddress(token)] = token.gecko_id;
  })
  const tokens = Object.keys(mapping)
  const finalRes = {} as any;
  const chunks = []
  const chunkSize = 50
  for (let i = 0; i < tokens.length; i += chunkSize) {
    chunks.push(tokens.slice(i, i + chunkSize))
  }

  for (const chunk of chunks) {
    const { data: res } = await axios(PRICES_API + "/current/" + chunk.join(","))
    Object.entries(res.coins).map(([key, value]: [any, any]) => {
      finalRes[mapping[key]] = value.price;
    })
  }
  finalRes["m-2"] = 1
  finalRes["terrausd"] = 0
  // kUSD has no price feed yet. It is minted and redeemed 1:1 for USDC through an on-chain
  // PSM, so read USDC's fetched price instead of pinning kUSD to a constant. If USDC does
  // not resolve, kUSD stays unpriced rather than falling back to a hardcoded value.
  if (finalRes["usd-coin"] !== undefined) finalRes["kerne-usd"] = finalRes["usd-coin"]
  return finalRes
}