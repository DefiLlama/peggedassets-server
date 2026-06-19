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
  return finalRes
}