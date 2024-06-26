const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
  bridgedSupplySubtractReserve,
  supplyInEthereumBridge,
} from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";
import * as stellar from "../helper/stellar";
const axios = require("axios");
const retry = require("async-retry");


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xdb25f211ab05b1c97d595516f45794528a807ad8"],
    unreleased: ["0x1bee4F735062CD00841d6997964F187f5f5F5Ac9"],
  },
  polygon: {
    bridgedFromETH: ["0xe111178a87a3bff0c8d18decba5798827539ae99"],
    unreleased: ["0x1bee4F735062CD00841d6997964F187f5f5F5Ac9"],
  },
  xdai: {
    bridgedFromETH: ["0x9EE40742182707467f78344F6b287bE8704F27E2"],
  },
  everscale: {
    bridgeOnETH: ["0x6b9f9cadb11690b2df23c3cfce383a6706f9a5e6"], // octus(?)
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

async function chainUnreleased(
  chain: string,
  decimals: number,
  target: string,
  reserves: string[]
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;

    for (let reserve of reserves) {
      const balance = (
        await sdk.api.erc20.balanceOf({
          target: target,
          owner: reserve,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedEUR", balance / 10 ** decimals);
    }

    return balances;
  };
}

async function ethereumUnreleased(decimals: number, reserves: string[]) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;

    let bridgedSupplyFunction = await chainUnreleased(
      "polygon",
      2,
      chainContracts.polygon.bridgedFromETH[0],
      chainContracts.polygon.unreleased
    );

    balances = await bridgedSupplyFunction(_timestamp, _ethBlock, _chainBlocks);

    for (let reserve of reserves) {
      const balance = (
        await sdk.api.erc20.balanceOf({
          target: chainContracts.ethereum.issued[0],
          owner: reserve,
          block: _chainBlocks?.["ethereum"],
          chain: "ethereum",
        })
      ).output;
      sumSingleBalance(balances, "peggedEUR", balance / 10 ** decimals);
    }

    return balances;
  };
}

async function algorandMinted() {
  // I gave up on trying to use the SDK for this
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supplyRes = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://mainnet-idx.algonode.cloud/v2/assets/227855942"
        )
    );
    const supply = supplyRes.data.asset.params.total;
    const reserveRes = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://mainnet-idx.algonode.cloud/v2/accounts/KJIKORX3CEQWN4VBI3A2MILSLZ7ITYWY7JRUYN4TK33KXCZSFOGSO2WIH4"
        )
    );
    const reserveAccount = reserveRes.data.account.assets.filter(
      (asset: any) => asset["asset-id"] === 227855942
    );
    const reserves = reserveAccount[0].amount;
    const balance = (supply - reserves) / 10 ** 6;
    sumSingleBalance(balances, "peggedEUR", balance, "issued", false);
    return balances;
  };
}

async function stellarMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supply = await stellar.getTotalSupply("EURS:GC5FGCDEOGOGSNWCCNKS3OMEVDHTE3Q5A5FEQWQKV3AXA7N6KDQ2CUZJ")
    sumSingleBalance(balances, "peggedEUR", supply, "issued", false)
    return balances;
  }
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 2),
    unreleased: ethereumUnreleased(2, chainContracts.ethereum.unreleased),
  },
  polygon: {
    ethereum: bridgedSupplySubtractReserve(
      "polygon",
      2,
      [
        chainContracts.polygon.bridgedFromETH[0],
        chainContracts.polygon.unreleased,
      ],
      "polygon",
      "Ethereum",
      "peggedEUR"
    ),
  },
  xdai: {
    ethereum: bridgedSupply(
      "xdai",
      2,
      chainContracts.xdai.bridgedFromETH,
      "gnosis",
      "Ethereum",
      "peggedEUR"
    ),
  },
  algorand: {
    minted: algorandMinted(),
  },
  everscale: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.everscale.bridgeOnETH[0],
      2,
      "peggedEUR"
    ),
  },
  stellar: {
    minted: stellarMinted(),
  },
};

export default adapter;
