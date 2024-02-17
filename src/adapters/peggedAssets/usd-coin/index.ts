const sdk = require("@defillama/sdk");
import { getTokenBalance as solanaGetTokenBalance } from "../helper/solana";
import {
  sumSingleBalance,
  sumMultipleBalanceFunctions,
} from "../helper/generalUtil";
import {
  bridgedSupply,
  supplyInEthereumBridge,
  solanaMintedOrBridged,
  terraSupply,
  cosmosSupply,
  kujiraSupply,
  osmosisSupply,
} from "../helper/getSupply";
import {
  getTotalSupply as ontologyGetTotalSupply,
  getBalance as ontologyGetBalance,
} from "../helper/ontology";
import { getTotalSupply as kavaGetTotalSupply } from "../helper/kava";
import { getTotalSupply as aptosGetTotalSupply } from "../helper/aptos";
import { call as nearCall } from "../llama-helper/near";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import {
  getTotalSupply as tronGetTotalSupply, // NOTE THIS DEPENDENCY
} from "../helper/tron";
import { mixinSupply } from "../helper/mixin";
import { chainContracts } from './config';
const axios = require("axios");
const retry = require("async-retry");


// If you are trying to test the adapter locally and it failed, try to comment out the lines related with dogechain and fuse

/*
Sora: cannot find API query that gives supply.

Cronos: they have not provided details about the wallets holding the USDC.

Flow: A.b19436aae4d94622.FiatToken. HTTP API has no info about tokens. Using Circle API for now.

Hedera missing 7M unreleased, is not in treasury account. Using Circle API because of this.

Stellar: 1 explorer doesn't work, 1 doesn't list it as an asset. Using Circle API for now.

Conflux: don't know how to make calls. celer: 0x6963EfED0aB40F6C3d7BdA44A05dcf1437C44372

Should check again for more unreleased tokens.

Gnosis: note there is 83M minted, 2.1M bridged, rest is here: 0x87D48c565D0D85770406D248efd7dc3cbd41e729

Velas: amount on chain does not match amount in multichain bridge, so it has not been added yet.

Juno, Crescent: missing Axelar bridged, no simple API to use, maybe can use axelarscan's

Sifchain: not sure where it's coming from/how to track
*/

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
        "peggedUSD",
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
      sumSingleBalance(balances, "peggedUSD", reserve / 10 ** decimals);
    }
    return balances;
  };
}

async function solanaUnreleased() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const unreleased = await solanaGetTokenBalance(
      chainContracts["solana"].issued[0],
      chainContracts["solana"].unreleased[0]
    );
    sumSingleBalance(balances, "peggedUSD", unreleased);
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
        await axios.get("https://mainnet-idx.algonode.cloud/v2/assets/31566704")
    );
    console.info("algorand 1 success USDC");
    const supply = supplyRes?.data?.asset?.params?.total;
    const reserveRes = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://mainnet-idx.algonode.cloud/v2/accounts/2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM"
        )
    );
    console.info("algorand 2 success USDC");
    const reserveAccount = reserveRes?.data?.account?.assets?.filter(
      (asset: any) => asset["asset-id"] === 31566704
    );
    const reserves = reserveAccount[0].amount;
    let balance = (supply - reserves) / 10 ** 6;
    sumSingleBalance(balances, "peggedUSD", balance, "issued", false);
    return balances;
  };
}

async function tronMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await tronGetTotalSupply(
      chainContracts["tron"].issued[0]
    );
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

async function hederaMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const issuance = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/0.0.456858"
        )
    );
    const supply = issuance?.data?.total_supply;
    let balance = supply / 10 ** 6;
    sumSingleBalance(balances, "peggedUSD", balance, "issued", false);
    return balances;
  };
}

async function circleAPIChainMinted(chain: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const issuance = await retry(
      async (_bail: any) =>
        await axios.get("https://api.circle.com/v1/stablecoins")
    );
    console.info("circle API success USDC");
    const usdcData = issuance.data.data.filter(
      (obj: any) => obj.symbol === "USDC"
    );
    const filteredChainsData = await usdcData[0].chains.filter(
      (obj: any) => obj.chain === chain
    );
    const supply = parseInt(filteredChainsData[0].amount);
    sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    return balances;
  };
}

async function suiBridged(chain:string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await axios.get(`https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/sui/usdc`)
    const totalSupply = parseInt(res.data.find((t:any)=>t.coin===`USDC_${chain}`).cumulative_balance);
    sumSingleBalance(balances, "peggedUSD", totalSupply, "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf", true);
    return balances;
  };
}

async function reinetworkBridged(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          `https://scan.rei.network/api?module=token&action=getToken&contractaddress=${address}`
        )
    );
    console.info("rei network success USDC");
    const totalSupply =
      parseInt(res?.data?.result?.totalSupply) / 10 ** decimals;
    sumSingleBalance(balances, "peggedUSD", totalSupply, address, true);
    return balances;
  };
}

async function karuraMinted(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          `https://blockscout.karura.network/api?module=token&action=getToken&contractaddress=getToken&contractaddress=${address}`
        )
    );
    console.info("karura success USDC");
    const supply = res?.data?.result?.totalSupply / 10 ** decimals;
    sumSingleBalance(
      balances,
      "peggedUSD",
      supply,
      "wormhole",
      false,
      "Ethereum"
    );
    return balances;
  };
}

async function ontologyBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const polyUSDCAddress = chainContracts.ontology.bridgedFromETH[0];
    const polyUSDCReserveAddress = chainContracts.ontology.unreleased[0];
    const polyNetworkSupply = await ontologyGetTotalSupply(
      polyUSDCAddress,
      "oep4"
    );
    const polyNetworkReserve = await ontologyGetBalance(
      polyUSDCAddress,
      "oep4",
      polyUSDCReserveAddress
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      polyNetworkSupply - polyNetworkReserve,
      polyUSDCAddress,
      true
    );

    const celerUSDCAddress = chainContracts.ontology.bridgedFromETH[1];
    const celerSupply = await ontologyGetTotalSupply(celerUSDCAddress, "orc20");
    sumSingleBalance(
      balances,
      "peggedUSD",
      celerSupply,
      celerUSDCAddress,
      true
    );
    return balances;
  };
}

async function nearBridged(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supply = await nearCall(address, "ft_total_supply");
    sumSingleBalance(
      balances,
      "peggedUSD",
      supply / 10 ** decimals,
      address,
      true
    );
    return balances;
  };
}

async function nearMint(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const mintedAmount = await nearCall(address, "ft_total_supply");
    sumSingleBalance(
      balances,
      "peggedUSD",
      mintedAmount / 10 ** decimals,
      address,
      false
    );
    return balances;
  };
}

async function elrondBridged(tokenID: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          `https://gateway.elrond.com/network/esdt/supply/${tokenID}`
        )
    );
    console.info("elrond success USDC");
    const supply = res?.data?.data?.supply / 10 ** decimals;
    sumSingleBalance(
      balances,
      "peggedUSD",
      supply,
      "adastra",
      false,
      "Ethereum"
    );
    return balances;
  };
}

async function kavaBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (const contract of chainContracts.kava.bridgedFromETH) {
      const totalSupply = await kavaGetTotalSupply(contract);
      sumSingleBalance(balances, "peggedUSD", totalSupply, contract, true);
    }
    return balances;
  };
}

async function aptosBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const contractStargate =
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa";
    const typeStargate =
      "0x1::coin::CoinInfo<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>";
    const totalSupplyStargate = await aptosGetTotalSupply(
      contractStargate,
      typeStargate
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupplyStargate,
      contractStargate,
      true
    );
    const contractPortal =
      "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea";
    const typePortal =
      "0x1::coin::CoinInfo<0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T>";
    const totalSupplyPortal = await aptosGetTotalSupply(
      contractPortal,
      typePortal
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupplyPortal,
      contractPortal,
      true
    );
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
    solana: bridgedSupply(
      "ethereum",
      6,
      chainContracts.ethereum.bridgedFromSol
    ),
    polygon: bridgedSupply(
      "ethereum",
      6,
      chainContracts.ethereum.bridgedFromPolygon
    ),
    bsc: bridgedSupply("ethereum", 18, chainContracts.ethereum.bridgedFromBSC),
  },
  polygon: {
    minted: chainMinted("polygon", 6),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "polygon",
      6,
      chainContracts.polygon.bridgedFromETH
    ),
    solana: bridgedSupply("polygon", 6, chainContracts.polygon.bridgedFromSol),
  },
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued),
    unreleased: solanaUnreleased(),
    ethereum: solanaMintedOrBridged(chainContracts.solana.bridgedFromETH),
    bsc: solanaMintedOrBridged(chainContracts.solana.bridgedFromBSC),
    polygon: solanaMintedOrBridged(chainContracts.solana.bridgedFromPolygon),
    avalanche: solanaMintedOrBridged(chainContracts.solana.bridgedFromAvax),
    celo: solanaMintedOrBridged(chainContracts.solana.bridgedFromCelo),
    fantom: solanaMintedOrBridged(chainContracts.solana.bridgedFromFantom),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: sumMultipleBalanceFunctions(
      [
        bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromETH),
        bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH18),
      ],
      "peggedUSD"
    ),
    solana: bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromSol),
    polygon: bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromPolygon),
    avalanche: bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromAvax),
  },
  avalanche: {
    minted: chainMinted("avax", 6),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("avax", 6, chainContracts.avax.bridgedFromETH),
    solana: bridgedSupply("avax", 6, chainContracts.avax.bridgedFromSol),
    bsc: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromBSC),
    polygon: bridgedSupply("avax", 6, chainContracts.avax.bridgedFromPolygon),
  },
  /* hacked, trading at $0.06
  harmony: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "harmony",
      6,
      chainContracts.harmony.bridgedFromETH
    ),
  },
  */
  arbitrum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "arbitrum",
      6,
      chainContracts.arbitrum.bridgedFromETH
    ),
  },
  era: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("era", 6, chainContracts.era.bridgedFromETH),
  },
  polygon_zkevm: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "polygon_zkevm",
      6,
      chainContracts.polygon_zkevm.bridgedFromETH
    ),
  },
  okexchain: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "okexchain",
      18,
      chainContracts.okexchain.bridgedFromETH
    ),
  },
  moonriver: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "moonriver",
      6,
      chainContracts.moonriver.bridgedFromETH,
      "multichain",
      "Ethereum"
    ),
  },
  moonbeam: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "moonbeam",
      6,
      chainContracts.moonbeam.bridgedFromETH
    ),
  },
  boba: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("boba", 6, chainContracts.boba.bridgedFromETH),
  },
  optimism: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "optimism",
      6,
      chainContracts.optimism.bridgedFromETH
    ),
  },
  metis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("metis", 6, chainContracts.metis.bridgedFromETH),
  },
  kcc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("kcc", 18, chainContracts.kcc.bridgedFromETH),
  },
  syscoin: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "syscoin",
      6,
      chainContracts.syscoin.bridgedFromETH,
      "multichain",
      "Ethereum"
    ),
  },
  tomochain: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "tomochain",
      6,
      chainContracts.tomochain.bridgedFromETH
    ),
  },
  ronin: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("ronin", 6, chainContracts.ronin.bridgedFromETH),
  },
  aurora: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    near: bridgedSupply("aurora", 6, chainContracts.aurora.bridgedFromNear),
  },
  fuse: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("fuse", 6, chainContracts.fuse.bridgedFromETH),
  },
  meter: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("meter", 6, chainContracts.meter.bridgedFromETH),
  },
  telos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("telos", 6, chainContracts.telos.bridgedFromETH),
  },
  milkomeda: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "milkomeda",
      6,
      chainContracts.milkomeda.bridgedFromETH
    ),
  },
  elastos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "elastos",
      6,
      chainContracts.elastos.bridgedFromETH
    ),
  },
  algorand: {
    minted: algorandMinted(),
    unreleased: async () => ({}),
  },
  tron: {
    minted: tronMinted(),
    unreleased: async () => ({}),
  },
  terra: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: terraSupply(chainContracts.terra.bridgedFromETH, 6),
    solana: terraSupply(chainContracts.terra.bridgedFromSol, 6),
    bsc: terraSupply(chainContracts.terra.bridgedFromBSC, 6),
    avalanche: terraSupply(chainContracts.terra.bridgedFromAvax, 6),
  },
  oasis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("oasis", 6, chainContracts.oasis.bridgedFromETH),
    solana: bridgedSupply("oasis", 6, chainContracts.oasis.bridgedFromSol),
    bsc: bridgedSupply("oasis", 18, chainContracts.oasis.bridgedFromBSC),
    polygon: bridgedSupply("oasis", 6, chainContracts.oasis.bridgedFromPolygon),
    avalanche: bridgedSupply("oasis", 6, chainContracts.oasis.bridgedFromAvax),
  },
  crab: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("crab", 6, chainContracts.crab.bridgedFromETH),
  },
  evmos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("evmos", 6, chainContracts.evmos.bridgedFromETH),
  },
  astar: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("astar", 6, chainContracts.astar.bridgedFromETH),
  },
  hedera: {
    minted: circleAPIChainMinted("HBAR"),
    unreleased: async () => ({}),
  },
  stellar: {
    minted: circleAPIChainMinted("XLM"),
    unreleased: async () => ({}),
  },
  flow: {
    minted: circleAPIChainMinted("FLOW"),
    unreleased: async () => ({}),
  },
  xdai: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("xdai", 6, chainContracts.xdai.bridgedFromETH),
  },
  theta: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("theta", 6, chainContracts.theta.bridgedFromETH),
  },
  rsk: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("rsk", 18, chainContracts.rsk.bridgedFromETH),
  },
  reinetwork: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: reinetworkBridged(chainContracts.reinetwork.bridgedFromETH[0], 6),
  },
  loopring: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.loopring.bridgeOnETH[0],
      6
    ),
  },
  zksync: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.zksync.bridgeOnETH[0],
      6
    ),
  },
  osmosis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: osmosisSupply(chainContracts.osmosis.bridgedFromETH, 6, "Axelar"),
    noble: osmosisSupply(chainContracts.osmosis.bridgedFromNoble, 6, "Noble"),
  },
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("fantom", 6, chainContracts.fantom.bridgedFromETH),
    solana: bridgedSupply("fantom", 6, chainContracts.fantom.bridgedFromSol),
  },
  dfk: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("dfk", 18, chainContracts.dfk.bridgedFromETH),
  },
  celo: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: sumMultipleBalanceFunctions(
      [
        bridgedSupply("celo", 6, chainContracts.celo.bridgedFromETH6Decimals),
        bridgedSupply("celo", 18, chainContracts.celo.bridgedFromETH18Decimals),
      ],
      "peggedUSD"
    ),
    avalanche: bridgedSupply("celo", 18, chainContracts.celo.bridgedFromAvax),
    polygon: bridgedSupply("celo", 6, chainContracts.celo.bridgedFromPolygon),
    solana: bridgedSupply("celo", 18, chainContracts.celo.bridgedFromSol),
  },
  kava: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: kavaBridged(),
  },
  karura: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: karuraMinted(chainContracts.karura.bridgedFromETH[0], 6),
  } /*
  ontology: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: ontologyBridged(),
  },*/,
  sx: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("sx", 6, chainContracts.sx.bridgedFromETH),
  },
  ethereumclassic: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "ethereumclassic",
      6,
      chainContracts.ethereumclassic.bridgedFromETH
    ),
  },
  wan: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("wan", 6, chainContracts.wan.bridgedFromETH),
  },
  near: {
    minted: nearMint(chainContracts.near.issued[0], 6),
    unreleased: async () => ({}),
    ethereum: nearBridged(chainContracts.near.bridgedFromETH[0], 6),
  },
  defichain: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.defichain.bridgeOnETH[0],
      6
    ),
  },
  klaytn: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("klaytn", 6, chainContracts.klaytn.bridgedFromETH),
  },
  elrond: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: elrondBridged("USDC-c76f1f", 6),
  },
  canto: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("canto", 6, chainContracts.canto.bridgedFromETH),
  },
  everscale: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.everscale.bridgeOnETH[0],
      6
    ),
  },
  dogechain: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "dogechain",
      6,
      chainContracts.dogechain.bridgedFromETH
    ),
  },
  kadena: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.kadena.bridgeOnETH[0],
      6
    ),
  },
  kardia: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("kardia", 6, chainContracts.kardia.bridgedFromETH),
  },
  arbitrum_nova: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "arbitrum_nova",
      6,
      chainContracts.arbitrum_nova.bridgedFromETH
    ),
  },
  aptos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: aptosBridged(),
  },
  mixin: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: mixinSupply(chainContracts.mixin.ethAssetIds, "Ethereum"),
    polygon: mixinSupply(chainContracts.mixin.polygonAssetIds, "Polygon"),
    bsc: mixinSupply(chainContracts.mixin.BSCAssetIds, "BSC"),
  },
  thundercore: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "thundercore",
      6,
      chainContracts.thundercore.bridgedFromETH
    ),
  },
  base: {
    minted: chainMinted("base", 6),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("base", 6, chainContracts.base.bridgedFromETH),
  },
  kujira: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: kujiraSupply(chainContracts.kujira.bridgedFromETH, 6, "Axelar"),
    noble: kujiraSupply(chainContracts.kujira.bridgedFromNoble, 6, "Noble"),
  },
  waves: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.waves.bridgeOnETH[0],
      6
    ),
  },
  sui:{
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: suiBridged("ETH"),
    bsc: suiBridged("BSC"),
    solana: suiBridged("SOLANA"),
    arbitrum: suiBridged("ARBITRUM_BRIDGED"),
  },
  starknet: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.starknet.bridgeOnETH[0],
      6
    ),
  },
};

export default adapter;
