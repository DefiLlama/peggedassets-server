//AUDD - Australian Dollar Stablecoin
// For any queries please submit a ticket via the contact form at https://audd.digital

const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { solanaMintedOrBridged } from "../helper/getSupply";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,  ChainContracts,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

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
  rbn: {
    issued: ["0x54a210e824B0F89dA988E4B5586440aB354f0e46"],
  },
  hedera: {
    issued: ["0x39ceba2b467fa987546000eb5d1373acf1f3a2e1"],
  },
  xdc: {
    issued: ["0x9fe4e6321eeb7c4bc537570f015e4734b15002b8"],
  },
  base: {
    issued: ["0x449b3317a6d1efb1bc3ba0700c9eaa4ffff4ae65"],
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
    const response = await axios.get(
      "https://api.stellar.expert/explorer/public/asset/AUDD-GDC7X2MXTYSAKUUGAIQ7J7RPEIM7GXSAIWFYWWH4GLNFECQVJJLB2EEU/supply",
      { responseType: "text" }
    );
    console.info("Stellar Expert API success for AUDD");

    // Convert the text response to a number. Ensure to handle possible NaN results.
    const circulatingSupply = Number(response.data);

    // Validate the conversion was successful (i.e., the result is not NaN)
    if (!isNaN(circulatingSupply)) {
      balances["peggedAUD"] = circulatingSupply;
    } else {
      console.error(
        "Error converting Stellar circulating supply to a number:",
        response.data
      );
    }
  } catch (error) {
    console.error("Error fetching Stellar circulating supply:", error);
  }
  return balances;
}

async function rippleMinted() {
  return async function () {
    const balances = {} as Balances;
    
    const NODE_URL = "https://xrplcluster.com";
    const address = "rUN5Zxt3K1AnMRJgEWywDJT8QDMMeLH5ok";
    const tokenCurrency = "4155444400000000000000000000000000000000"; // AUDD currency code
    
    const payload = {
      method: "gateway_balances",
      params: [
        {
          account: address,
          ledger_index: "validated",
        },
      ],
    };

    const res = await retry(async (_bail: any) => axios.post(NODE_URL, payload));
    
    if (res.data.result && res.data.result.obligations && res.data.result.obligations[tokenCurrency]) {
      const supplyStr = res.data.result.obligations[tokenCurrency];
      const supply = parseFloat(supplyStr);
      sumSingleBalance(balances, "peggedAUD", supply, "issued", false);
    }
    
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 6),
  },
  stellar: {
    minted: fetchStellarCirculatingSupply, // This should be a reference to your async function, not a type
  },
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued, "peggedAUD"),
  },
  rbn: {
    minted: chainMinted("rbn", 6),
  },
  hedera: {
    minted: chainMinted("hedera", 6),
  },
  xdc: {
    minted: chainMinted("xdc", 6),
  },
  base: {
    minted: chainMinted("base", 6),
  },
  ripple: {
    minted: rippleMinted(),
  },
};

export default adapter;
