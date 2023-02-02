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
const axios = require("axios");
const retry = require("async-retry");

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
    unreleased: ["0x55fe002aeff02f77364de339a1292923a15844b8"], // circle wallet
    bridgedFromSol: ["0x41f7B8b9b897276b7AAE926a9016935280b44E97"], // wormhole
    bridgedFromBSC: ["0x7cd167B101D2808Cfd2C45d17b2E7EA9F46b74B6"], // wormhole
    bridgedFromPolygon: ["0x566957eF80F9fd5526CD2BEF8BE67035C0b81130"], // wormhole
  },
  polygon: {
    bridgeOnETH: ["0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf"],
    bridgedFromETH: [
      "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      "0x4318cb63a2b8edf2de971e2f17f77097e499459d", // wormhole
      "0x750e4c4984a9e0f12978ea6742bc1c5d248f40ed", // axelar
      "0x5bEF2617eCCA9a39924c09017c5F1E25Efbb3bA8", // orbit
    ],
    bridgedFromSol: ["0x576cf361711cd940cd9c397bb98c4c896cbd38de"], // wormhole
  },
  bsc: {
    bridgeOnETH: ["0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503"],
    bridgedFromSol: ["0x91Ca579B0D47E5cfD5D0862c21D5659d39C8eCf0"], // wormhole
    bridgedFromETH: ["0xB04906e95AB5D797aDA81508115611fee694c2b3"], // wormhole
    bridgedFromETH18: ["0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"],
    bridgedFromPolygon: ["0x672147dD47674757C457eB155BAA382cc10705Dd"], // wormhole
    bridgedFromAvax: ["0xc1F47175d96Fe7c4cD5370552e5954f384E3C791"], // wormhole
  },
  avax: {
    // should check these amounts
    bridgeOnETH: ["0xe78388b4ce79068e89bf8aa7f218ef6b9ab0e9d0"],
    bridgedFromETH: [
      "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
      "0xB24CA28D4e2742907115fECda335b40dbda07a4C", // wormhole
      "0xfab550568c688d5d8a52c7d794cb93edc26ec0ec", // axelar
    ],
    bridgedFromSol: ["0x0950Fc1AD509358dAeaD5eB8020a3c7d8b43b9DA"], // wormhole
    bridgedFromBSC: ["0x6145E8a910aE937913426BF32De2b26039728ACF"], // wormhole
    bridgedFromPolygon: ["0x543672E9CBEC728CBBa9C3Ccd99ed80aC3607FA8"], // wormhole
    issued: ["0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"],
  },
  solana: {
    issued: ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"],
    bridgedFromETH: [
      "FVsXUnbhifqJ4LiXQEbpUtXVdB8T5ADLKqSs5t1oc54F", // wormhole v1
      "A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM", // wormhole
      "DdFPRnccQqLD4zCHrBqdY95D6hvw6PLWp9DEXj1fLCL9", // allbridge
    ],
    bridgedFromBSC: [
      "FCqfQSujuPxy6V42UvafBhsysWtEq1vhjfMN1PUbgaxA", // wormhole
      "8XSsNvaKU9FDhYWAv7Yc7qSNwuJSzVrXBNEk7AFiWF69", // allbridge
    ],
    bridgedFromPolygon: [
      "E2VmbootbVCBkMNNxKQgCLMS1X3NoGMaYAsufaAsf7M", // wormhole
      "eqKJTf1Do4MDPyKisMYqVaUFpkEFAs3riGF3ceDH2Ca", // allbridge
    ],
    bridgedFromAvax: [
      "AGqKX7F4mqJ8x2mUQVangJb5pWQJApaKoUfe5gXM53CV", // wormhole
      "8Yv9Jz4z7BUHP68dz8E8m3tMe6NKgpMUKn8KVqrPA6Fr", // allbridge
    ],
    bridgedFromCelo: ["DHpoYejUDqzByb6HAdaLWF7KZvwUv2vWYDY9cTENNZui"], // allbridge
    bridgedFromFantom: ["Grk6b4UMRWkgyq4Y6S1BnNRF4hRgtnMFp7Sorkv6Ez4u"], // allbridge
    unreleased: ["7VHUFJHWu2CuExkJcJrzhQPJ2oygupTWkL2A2For4BmE"], // address doesn't seem correct, just coincidence has correct amount
  },
  arbitrum: {
    bridgeOnETH: ["0xcee284f754e854890e311e3280b767f80797180d"],
    bridgedFromETH: ["0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"],
  },
  optimism: {
    bridgeOnETH: ["0x99c9fc46f92e8a1c0dec1b1747d010903e884be1"],
    bridgedFromETH: ["0x7f5c764cbc14f9669b88837ca1490cca17c31607"],
  },
  boba: {
    bridgeOnETH: ["0xdc1664458d2f0b6090bea60a8793a4e66c2f1c00"],
    bridgedFromETH: ["0x66a2a913e447d6b4bf33efbec43aaef87890fbbc"],
  },
  metis: {
    bridgeOnETH: ["0x3980c9ed79d2c191A89E02Fa3529C60eD6e9c04b"],
    bridgedFromETH: ["0xea32a96608495e54156ae48931a7c20f0dcc1a21"],
  },
  moonbeam: {
    bridgeOnETH: ["0xec4486a90371c9b66f499ff3936f29f0d5af8b7e"],
    bridgedFromETH: [
      "0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b", // multichain
      "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98", // celer
      //"0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9", // nomad, hacked, trading at $0.15
      "0xca01a1d0993565291051daff390892518acfad3a", // axelar
    ],
  },
  kcc: {
    bridgeOnETH: ["0xD6216fC19DB775Df9774a6E33526131dA7D19a2c"], //there is another one with same amount? check for usdt too
    bridgedFromETH: ["0x980a5afef3d17ad98635f6c5aebcbaeded3c3430"],
  },
  moonriver: {
    bridgeOnETH: ["0x10c6b61dbf44a083aec3780acf769c77be747e23"],
    bridgedFromETH: ["0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d"], // multichain
  },
  harmony: {
    bridgeOnETH: ["0x2dccdb493827e15a5dc8f8b72147e6c4a5620857"],
    bridgedFromETH: ["0x985458e523db3d53125813ed68c274899e9dfab4"],
  },
  syscoin: {
    bridgeOnETH: ["0x8cC49FE67A4bD7a15674c4ffD4E969D94304BBbf"],
    bridgedFromETH: ["0x2bf9b864cdc97b08b6d79ad4663e71b8ab65c45c"], // multichain
  },
  okexchain: {
    bridgeOnETH: ["0x2c8FBB630289363Ac80705A1a61273f76fD5a161"],
    bridgedFromETH: ["0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85"],
  },
  tomochain: {
    bridgedFromETH: ["0xcca4e6302510d555b654b3eab9c0fcb223bcfdf0"],
  },
  ronin: {
    bridgedFromETH: ["0x0b7007c13325c48911f73a2dad5fa5dcbf808adc"],
  },
  aurora: {
    bridgeOnETH: ["0x23Ddd3e3692d1861Ed57EDE224608875809e127f"],
    bridgedFromNear: ["0xB12BFcA5A55806AaF64E99521918A4bf0fC40802"], // rainbow bridge
    /*
    this is claimed by both rainbow bridge and celer. there does not appear to be enough in the
    rainbow bridge and celer bridge contracts on ethereum for both aurora and near to have
    USDC bridged independently, and near dev claims aurora's USDC may be a subset of near's
    */
  },
  fuse: {
    bridgedFromETH: ["0x620fd5fa44be6af63715ef4e65ddfa0387ad13f5"],
  },
  meter: {
    bridgedFromETH: ["0xd86e243fc0007e6226b07c9a50c9d70d78299eb5"],
  },
  telos: {
    bridgedFromETH: ["0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b"], // multichain
  },
  milkomeda: {
    bridgedFromETH: [
      "0xb44a9b6905af7c801311e8f4e76932ee959c663c", // multichain
      "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98", // celer
      //"0x5a955FDdF055F2dE3281d99718f5f1531744B102", // nomad, hacked
    ],
  },
  elastos: {
    bridgedFromETH: ["0xa06be0f5950781ce28d965e5efc6996e88a8c141"],
  },
  tron: {
    issued: ["TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8"],
  },
  terra: {
    bridgedFromSol: ["terra1e6mq63y64zcxz8xyu5van4tgkhemj3r86yvgu4"], // wormhole
    bridgedFromETH: ["terra1pepwcav40nvj3kh60qqgrk8k07ydmc00xyat06"], // wormhole
    bridgedFromBSC: ["terra1yljlrxvkar0c6ujpvf8g57m5rpcwl7r032zyvu"], // wormhole
    bridgedFromPolygon: ["terra1kkyyh7vganlpkj0gkc2rfmhy858ma4rtwywe3x"], // wormhole
    bridgedFromAvax: ["terra1pvel56a2hs93yd429pzv9zp5aptcjg5ulhkz7w"], // wormhole
  },
  oasis: {
    bridgedFromSol: ["0x1d1149a53deB36F2836Ae7877c9176413aDfA4A8"], // wormhole
    bridgedFromETH: [
      "0xE8A638b3B7565Ee7c5eb9755E58552aFc87b94DD", // wormhole
      "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c", // celer
    ],
    // 0x94fbfFe5698DB6f54d6Ca524DbE673a7729014Be is EvoDefi, rugged and trading at $0.20
    bridgedFromBSC: ["0x4cA2A3De42eabC8fd8b0AC46127E64DB08b9150e"], // wormhole
    bridgedFromPolygon: ["0x3E62a9c3aF8b810dE79645C4579acC8f0d06a241"], // wormhole
    bridgedFromAvax: ["0x05CbE6319Dcc937BdbDf0931466F4fFd0d392B47"], // wormhole
  },
  evmos: {
    bridgedFromETH: [
      "0xe46910336479F254723710D57e7b683F3315b22B", // celer
      //"0x51e44FfaD5C2B122C8b635671FCC8139dc636E82", // nomad, hacked, trading at $0.16
      "0x2C78f1b70Ccf63CDEe49F9233e9fAa99D43AA07e", // multichain
    ],
  },
  crab: {
    bridgedFromETH: ["0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c"], // celer
  },
  astar: {
    bridgedFromETH: [
      "0xfa9343c3897324496a05fc75abed6bac29f8a40f", // multichain
      "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98", // celer
    ],
  },
  xdai: {
    bridgedFromETH: ["0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83"],
  },
  theta: {
    bridgedFromETH: ["0x3Ca3fEFA944753b43c751336A5dF531bDD6598B6"], // multichain
  },
  rsk: {
    bridgedFromETH: ["0x1bda44fda023f2af8280a16fd1b01d1a493ba6c4"],
  },
  reinetwork: {
    bridgedFromETH: ["0x8d5E1225981359E2E09A3AB8F599A51486f53314"], // celer
  },
  loopring: {
    bridgeOnETH: ["0x674bdf20A0F284D710BC40872100128e2d66Bd3f"],
  },
  zksync: {
    bridgeOnETH: ["0xaBEA9132b05A70803a4E85094fD0e1800777fBEF"],
  },
  fantom: {
    /*
     * Note there are discrepancies in amounts in bridge contracts and how much
     * is minted on Fantom. Assuming most is bridged from ETH for now.
     */
    bridgedFromETH: [
      "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", // multichain
      "0x2Ec752329c3EB419136ca5e4432Aa2CDb1eA23e6", // wormhole
      "0x1b6382dbdea11d97f24495c9a90b7c88469134a4", // axelar
    ],
    bridgedFromSol: ["0xb8398DA4FB3BC4306B9D9d9d13d9573e7d0E299f"], // wormhole
  },
  dfk: {
    bridgedFromETH: ["0x3ad9dfe640e1a9cc1d9b0948620820d975c3803a"], // synapse
  },
  celo: {
    bridgedFromETH6Decimals: [
      "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a", // optics
      "0x37f750B7cC259A2f741AF45294f6a16572CF5cAd", // wormhole
    ],
    bridgedFromETH18Decimals: ["0x93DB49bE12B864019dA9Cb147ba75cDC0506190e"], // moss
    bridgedFromPolygon: ["0x1bfc26cE035c368503fAE319Cc2596716428ca44"], // optics
    bridgedFromAvax: ["0xb70e0a782b058BFdb0d109a3599BEc1f19328E36"], // allbridge
    bridgedFromSol: ["0xCD7D7Ff64746C1909E44Db8e95331F9316478817"], // allbridge
  },
  kava: {
    bridgedFromETH: [
      "0x23367BEA9B6931690960d8c59f6e708630f24E58", // celer
      "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f", // multichain
    ],
  },
  karura: {
    bridgedFromETH: ["0x1F3a10587A20114EA25Ba1b388EE2dD4A337ce27"], // wormhole
  },
  ontology: {
    bridgedFromETH: [
      "061a07cd393aac289b8ecfda2c3784b637a2fb33", // poly network
      "0x08f7e8a161652d9f2fbfe200b18709540de5ced1", // celer
    ],
    unreleased: ["AVaijxNJvAXYdNMVSYAfT8wVTh8tNHcTBM"], // poly network reserve
  },
  sx: {
    bridgedFromETH: ["0xe2aa35C2039Bd0Ff196A6Ef99523CC0D3972ae3e"], // celer
  },
  ethereumclassic: {
    bridgedFromETH: ["0xC1Be9a4D5D45BeeACAE296a7BD5fADBfc14602C4"], // multichain
  },
  wan: {
    bridgedFromETH: ["0x52A9CEA01c4CBDd669883e41758B8eB8e8E2B34b"], // wan
  },
  near: {
    bridgedFromETH: [
      "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
    ], // rainbow bridge
  },
  defichain: {
    bridgeOnETH: ["0x94fa70d079d76279e1815ce403e9b985bccc82ac"], // seems there is no direct bridge from ETH. but users can withdraw to defichain using cake defi?
  },
  klaytn: {
    bridgedFromETH: ["0x754288077d0ff82af7a5317c7cb8c444d421d103"], // orbit (bridge has some in farms, check DL adapter)
  },
  canto: {
    bridgedFromETH: ["0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd"], // canto/gravity
  },
  everscale: {
    bridgeOnETH: ["0xF8A0D53DDC6C92c3c59824f380C0f3d2a3cf521C"], // octus(?)
  },
  dogechain: {
    bridgedFromETH: ["0x765277EebeCA2e31912C9946eAe1021199B39C61"], // multichain
  },
  kadena: {
    bridgeOnETH: ["0x3765f3e827f4AB5393c1cb2D85bAcd37664cE8cA"], // lago
  },
  kardia: {
    bridgedFromETH: ["0x765277EebeCA2e31912C9946eAe1021199B39C61"], // multichain
  },
  arbitrum_nova: {
    bridgedFromETH: ["0x750ba8b76187092B0D1E87E28daaf484d1b5273b"],
  },
  aptos: {
    bridgedFromETH: [
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa", // stargate
      "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea"  // wormhole
    ],
  },
};

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
        await axios.get(
          "https://algoindexer.algoexplorerapi.io/v2/assets/31566704"
        )
    );
    console.info("algorand 1 success USDC");
    const supply = supplyRes?.data?.asset?.params?.total;
    const reserveRes = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://algoindexer.algoexplorerapi.io/v2/accounts/2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM"
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
    const contractStargate = "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa";
    const typeStargate =
      "0x1::coin::CoinInfo<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>";
    const totalSupplyStargate = await aptosGetTotalSupply(contractStargate, typeStargate);
    sumSingleBalance(balances, "peggedUSD", totalSupplyStargate, contractStargate, true);
    const contractPortal = "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea";
    const typePortal =
      "0x1::coin::CoinInfo<0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T>";
    const totalSupplyPortal = await aptosGetTotalSupply(contractPortal, typePortal);
    sumSingleBalance(balances, "peggedUSD", totalSupplyPortal, contractPortal, true);
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
    minted: async () => ({}),
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
    ethereum: osmosisSupply("usdc", "Axelar", "Ethereum"),
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
  },
  ontology: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: ontologyBridged(),
  },
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
    minted: async () => ({}),
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
};

export default adapter;
