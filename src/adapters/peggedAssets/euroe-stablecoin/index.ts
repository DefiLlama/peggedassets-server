import axios from "axios";
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  Balances, ChainContracts,
} from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x820802Fa8a99901F52e39acD21177b0BE6EE2974"],
  },
  polygon: {
    issued: ["0x820802Fa8a99901F52e39acD21177b0BE6EE2974"],
  },
  arbitrum: {
    issued: ["0xcF985abA4647a432E60efcEeB8054BBd64244305"],
  },
  avax: {
    issued: ["0x820802Fa8a99901F52e39acD21177b0BE6EE2974"],
  },
  solana: {
    issued: ["2VhjJ9WxaGC3EZFwJG9BDUs9KxKCAjQY4vgd1qxgYWVg"],
  },
  optimism: {
    issued: ["0x820802Fa8a99901F52e39acD21177b0BE6EE2974"],
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, {
  pegType: 'peggedEUR'
});

async function concordiumMinted() {
  let balances = {} as Balances;
  const { data: res } = await axios("https://www.euroe.com/api/totalsupply/CCD");
  sumSingleBalance(balances, "peggedEUR", Number(res.toFixed(2)), 'euroe', true);
  return balances;
}

adapter.concordium = { minted: concordiumMinted, }

export default adapter;
