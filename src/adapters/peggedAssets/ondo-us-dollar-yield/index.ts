const sdk = require("@defillama/sdk");
import { sumSingleBalance } from '../helper/generalUtil';
import { addChainExports, cosmosSupply } from "../helper/getSupply";
import { ChainBlocks, PeggedIssuanceAdapter, Balances } from "../peggedAsset.type";
import { getTotalSupply as stellarGetTotalSupply } from "../helper/stellar";
import { getResources } from '../helper/aptos';
const axios = require("axios");
const retry = require("async-retry");

function nobleSupply() {
  return cosmosSupply("noble", ['ausdy'], 18, '', 'peggedUSD');
}

async function bridgedFromNoble(channel: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    // Fetch the escrow address for the given IBC channel
    const escrowResponse = await retry(async (_bail: any) =>
      axios.get(`https://noble-api.polkachu.com/ibc/apps/transfer/v1/channels/${channel}/ports/transfer/escrow_address`)
    );
    const escrowAddress = escrowResponse?.data?.escrow_address;

    // Fetch the balance of the escrow address
    const balanceResponse = await retry(async (_bail: any) =>
      axios.get(`https://noble-api.polkachu.com/cosmos/bank/v1beta1/balances/${escrowAddress}/by_denom?denom=ausdy`)
    );

    const circulatingSupply = balanceResponse?.data?.balance?.amount / 1e18;
    let balances = {};
    sumSingleBalance(balances, "peggedUSD", circulatingSupply, "issued", false);
    return balances;
  };
}

async function stellarMinted(assetID: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await stellarGetTotalSupply(assetID);
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

async function aptosMinted(coinType: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const endpoint = process.env.APTOS_RPC ?? "https://fullnode.mainnet.aptoslabs.com";
    const response = await retry(async (_bail: any) =>
      axios.post(`${endpoint}/v1/view`, {
        function: "0x1::coin::supply",
        type_arguments: [coinType],
        arguments: [],
      })
    );
    const supply = response.data[0].vec[0];
    const totalSupply = parseInt(supply) / 1e6;
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

const chainContracts = {
  ethereum: {
    issued: [
      "0x96F6eF951840721AdBF46Ac996b59E0235CB985C", // USDY
      "0xe86845788d6e3E5C2393ADe1a051AE617D974C09", // USDYc
    ],
  },
  mantle: {
    issued: "0x5bE26527e817998A7206475496fDE1E68957c5A6",
  },
  sui: {
    issued: [
      "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY",
    ],
  },
  solana: {
    issued: ["A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6"],
  },
  arbitrum: {
    issued: ["0x35e050d3C0eC2d29D269a8EcEa763a183bDF9A9D"]
  },
  stellar: {
    issued: ["USDY:GAJMPX5NBOG6TQFPQGRABJEEB2YE7RFRLUKJDZAZGAD5GFX4J7TADAZ6"],
  },
};

// Use `addChainExports` to generate the final adapter with combined logic
const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
  noble: {
    minted: nobleSupply()
  },
  injective: {
    noble: bridgedFromNoble("channel-31"),
  },
  osmosis: {
    noble: bridgedFromNoble("channel-1"),
  },
  mantra: {
    noble: bridgedFromNoble("channel-101"),
  },
  penumbra: {
    noble: bridgedFromNoble("channel-89"),
  },
  stellar: {
    minted: stellarMinted(chainContracts.stellar.issued[0]),
  },
  aptos: {
    minted: aptosMinted("0xcfea864b32833f157f042618bd845145256b1bf4c0da34a7013b76e42daa53cc::usdy::USDY"),
  },
};

export default adapter;
