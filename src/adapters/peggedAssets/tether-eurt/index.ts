const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
} from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xC581b735A1688071A1746c968e0798D642EDE491"],
    unreleased: ["0x5754284f345afc66a98fbb0a0afe71e0f007b949"],
  },
  polygon: {
    bridgedFromETH: ["0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f"],
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
        "peggedEUR",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

async function chainUnreleased(chain: string, decimals: number, owner: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const reserve = (
        await sdk.api.erc20.balanceOf({
          target: issued,
          owner: owner,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedEUR", reserve / 10 ** decimals);
    }
    return balances;
  };
}

async function omniMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const options = {
      method: "post",
      url: "https://api.omniexplorer.info/v1/properties/listbyecosystem",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "ecosystem=1",
    };
    const res = await retry(async (_bail: any) => await axios(options));
    const totalSupply = parseInt(res.data.properties[461].totaltokens);
    sumSingleBalance(balances, "peggedEUR", totalSupply, "issued", false);
    return balances;
  };
}

async function omniUnreleased() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const options = {
      method: "post",
      url: "https://api.omniexplorer.info/v1/address/addr",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "addr=1NTMakcgVwQpMdGxRQnFKyb3G1FAJysSfz",
    };
    const res = await retry(async (_bail: any) => await axios(options));
    const account = res.data.balance.filter((obj: any) => obj.id === "41");
    const balance = parseInt(account[0].value);
    sumSingleBalance(balances, "peggedEUR", balance / 10 ** 8);
    return balances;
  };
}

async function usdtApiMinted(key: string) {
  // would be better to replace with different api or on-chain calls
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios("https://app.tether.to/transparency.json")
    );
    const issuance = res.data.data.usdt;
    const totalSupply = parseInt(issuance[key]);
    sumSingleBalance(balances, "peggedEUR", totalSupply, "issued", false);
    return balances;
  };
}

async function usdtApiUnreleased(key: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios("https://app.tether.to/transparency.json")
    );
    const issuance = res.data.data.usdt;
    const totalSupply = parseInt(issuance[key]);
    sumSingleBalance(balances, "peggedEUR", totalSupply);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 6),
    unreleased: chainUnreleased(
      "ethereum",
      6,
      chainContracts.ethereum.unreleased[0]
    ),
  },
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "polygon",
      6,
      chainContracts.polygon.bridgedFromETH,
      "polygon",
      "Ethereum",
      "peggedEUR"
    ),
  },
  omni: {
    minted: omniMinted(),
    unreleased: omniUnreleased(),
  },
};

export default adapter;
