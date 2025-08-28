import { ChainApi } from "@defillama/sdk";
import { sumSingleBalance } from "../helper/generalUtil";
import {
  Balances,
  PeggedAssetType,
  PeggedIssuanceAdapter
} from "../peggedAsset.type";
const axios = require("axios");

const factory = 'factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt'

async function osmosisMinted (token: string, decimals: number, pegType: PeggedAssetType) {
  return async function (_api: ChainApi) {
    let balances = {} as Balances;
    const url = `https://rest-osmosis.ecostake.com/osmosis/superfluid/v1beta1/supply?denom=${token}`
    const { data } = await axios.get(url)
    const amount = parseInt(data.amount.amount) / 10 ** decimals
    sumSingleBalance(balances, pegType, amount, "issued", false)
    return balances;
  } 
}

const adapter: PeggedIssuanceAdapter = {
  osmosis: {
    minted: osmosisMinted(factory, 6, 'peggedVAR'),
  },
};

export default adapter;
