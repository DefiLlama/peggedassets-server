const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { solanaMintedOrBridged } from "../helper/getSupply";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};
interface AssetSupplyFetched {
  circulating: number;
}


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x4cce605ed955295432958d8951d0b176c10720d5"],
  },
  solana: {
    issued: ["AUDDttiEpCydTm7joUMbYddm72jAWXZnCpPZtDoxqBSw"],
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedAUD",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
  }
  async function fetchStellarCirculatingSupply(): Promise<Balances> {
    let balances = {} as Balances;
    try {
        // Make the request using axios.get, which will return the response as plain text
        const response = await axios.get("https://api.stellar.expert/explorer/public/asset/AUDD-GDC7X2MXTYSAKUUGAIQ7J7RPEIM7GXSAIWFYWWH4GLNFECQVJJLB2EEU/supply", { responseType: 'text' });
        console.info("Stellar Expert API success for AUDD");

        // Convert the text response to a number. Ensure to handle possible NaN results.
        const circulatingSupply = Number(response.data);
        
        // Validate the conversion was successful (i.e., the result is not NaN)
        if (!isNaN(circulatingSupply)) {
            balances['peggedAUD'] = circulatingSupply; 
        } else {
            console.error("Error converting Stellar circulating supply to a number:", response.data);
        }
    } catch (error) {
        console.error("Error fetching Stellar circulating supply:", error);
    }
    return balances;
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 6),
    unreleased: async () => ({}),
  },
stellar: {
  minted: fetchStellarCirculatingSupply, // This should be a reference to your async function, not a type
  unreleased: async () => ({}),
},
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued, "peggedAUD"),
    unreleased: async () => ({}),
  },
};

export default adapter;