import { ChainApi } from "@defillama/sdk";
import { sumSingleBalance } from "../helper/generalUtil";
import { getApi } from "../helper/getSupply";
import { Balances, ChainContracts, PeggedIssuanceAdapter } from "../peggedAsset.type";
const axios = require("axios");

const API_URL = 'https://www.gate.com/apim/v3/earn/staking/product?coin=GUSD'

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ['0xaf6186b3521b60e27396b5d23b48abc34bf585c5'], // GUSD
  }
}

const chainMinted = (chain: string, decimals: number) => {
  return async (_api: ChainApi) => {
    const api = await getApi(chain, _api)
    const balances: Balances = {}

    for (const issued of chainContracts[chain].issued) {
      const totalSupply = await api.call({ abi: "erc20:totalSupply", target: issued })
      sumSingleBalance(balances, "peggedUSD", Number(totalSupply) / 10 ** decimals, "issued", false)
    }

    return balances
  }
}

const unreleased = async (): Promise<Balances> => {
  const balances: Balances = {}
  const { data } = await axios.get(API_URL)
  const amount = Math.round(data?.data?.hold_amount_total)
  sumSingleBalance(balances, "peggedUSD", amount, "unreleased", false)
  return balances
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted('ethereum', 6),
    unreleased
  }
}

export default adapter