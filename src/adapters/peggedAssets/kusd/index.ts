/*
 * DeFiLlama stablecoins (peggedassets-server) adapter — Bankcoin kUSD.
 *
 * PR target: github.com/DefiLlama/peggedassets-server
 *   src/adapters/peggedAssets/<coingecko-asset-id>/index.ts
 *   (folder is named after the CoinGecko asset id — assign once the CoinGecko
 *    listing for kUSD is approved; placeholder folder name: kusd)
 *
 * Format matches the repo's current addChainExports pattern (checked
 * 2026-07-07 against src/adapters/peggedAssets/frankencoin/index.ts and
 * helper/getSupply.ts).
 *
 * Semantics:
 *   issued     = on-chain totalSupply() of kUSD on each chain (native issuance
 *                on both chains — no bridged double counting).
 *   unreleased = protocol-controlled balances that are NOT circulating float:
 *                the market-maker operational wallet + the 38 auto-convert
 *                vault balances per chain. This list is identical, by
 *                construction, to the issuer's public machine-readable
 *                exclusion registry, so DeFiLlama's circulating figure equals
 *                the issuer's published number:
 *                  registry: https://assets.bankcoin.capital/supply/exclusions.json
 *                  audit view: https://assets.bankcoin.capital/supply/meta?symbol=kUSD&chainId=8453
 *                  plain number: https://assets.bankcoin.capital/supply/circulating?symbol=kUSD&chainId=8453
 *
 * pegType: peggedUSD; pegMechanism: fiat-backed; decimals: 6 on both chains.
 */

import { addChainExports } from "../helper/getSupply";

// Market-maker operational wallet (same address on Base and Arbitrum One).
const MM_WALLET = "0xfC16F21d1fa1411780e3f9343B7801C96822e1E3";

// Auto-convert vault set ("one address per kStable"): any vault may hold kUSD
// transiently; all are protocol-owned, so all are excluded from circulating.
const BASE_CONVERT_VAULTS = [
  "0xBaEb0a6FB48E7b4b69F89a98E91E897D77ED94fd", // kAED
  "0x8753b84784Ff04a86d497c410910A6Aa3BdA517A", // kARS
  "0xF3fBc6bE0DEb32260CcD98FDa90B440b850ce1ec", // kAUD
  "0xe2a9B80b314D7Fdd7C8C40845d1dB4177C384169", // kBDT
  "0x9b442E7eB807DdBa3094d6f6c0d1bD1a4DD253fc", // kBRL
  "0x12771b287058883678161350d135D1ABeF729222", // kCAD
  "0x53f3E021CB2383a8Cc140AAEa6790412699B4FA0", // kCHF
  "0x39F6f16841a9FfD3Aded8Ad0Acf219735D0De1D2", // kCNH
  "0x7e1463381Af4079D1Ee343c33993A10d5812fAAC", // kEGP
  "0x76FB82Ad5fE70E5621Abb5526b96bDddBa5437df", // kEUR
  "0xF0f33edAfFA1a3c319F63E529587FBaf95393210", // kGBP
  "0xe65Ee92Aa5D4E898193FCf5A8DAA89eD83ed427F", // kGHS
  "0x4dB60a34E301DBcBdc12a0cC7c830D28e893440a", // kHKD
  "0xe941fEa57121E5B87C3635489f14D357e166eFC5", // kIDR
  "0xB7DB677b25Be1c03BAF0d7B13b5219863181E9C6", // kILS
  "0x06933c1C50aff2dA880B823775223b8Ef1352711", // kINR
  "0x4Bb3f2d86F1d7dce66bEA80F14caE91EC7138Af3", // kJPY
  "0x051460070F7603A49b2DdB527Ecd18dc59808479", // kKES
  "0xF620DEC43BCDbEa794992094fa147a0307D9AB69", // kKRW
  "0x70b0E3a0867c86D9DFaC086300c2BB1CB1ad1E3C", // kMXN
  "0x1488567884b47713203b747Dd7FAF8887686Bb98", // kMYR
  "0x54CAdE53056594f95C3b330a90f82Fc90E075FFd", // kNGN
  "0xc01fDc1b1dB85b640a2E2f6605A489d55C96edb5", // kNOK
  "0x7767AD8706c03215A38721D5b5AfeDcbF55062D2", // kNZD
  "0xC9840F317705D00EDab98BAA2C65a52551150400", // kPHP
  "0x493256453e8Ac842d395ea0171AF57BD747855B7", // kPKR
  "0xD74ca6E897ea1Fe1E96cad9094Eb9E3dE5065365", // kPLN
  "0x5ab47F083324C768e0B30514F7F400B6e5A403C7", // kSAR
  "0x6cEb41963ef4E5aEB406D13878eEf59569a74F18", // kSEK
  "0xBbE8DA70b570c3bD580eB9E0dAaa3180d874e986", // kSGD
  "0x376aB39CAE3753297239cB81DBf1bfb80Bb7751A", // kTHB
  "0xB8ec11081159324D3D6aEaD8b69BE65F1d9D2eb2", // kTRY
  "0xDc26f83cc85401E1bFa12c2352799798dFA58506", // kTWD
  "0xf3eCe3A63922f327dfaFf07BeBC28697fBbD4FE7", // kUSD
  "0xFEB2f30DcF4a331269A190ac920068F439513e8C", // kVND
  "0xE28F14f5bd8E4b4b5955009E589ced735bEf16bb", // kXAF
  "0x693D97EC971adB5F08E6e5B16b42Ff5260a92c7F", // kXOF
  "0x52292cB7bA4F57223dC52ED973a38B80666A52e9", // kZAR
];

const ARBITRUM_CONVERT_VAULTS = [
  "0x09e3f64fa95A4839357431153a1938cdfa0eeE8b", // kAED
  "0xaA2B148aA04A86eeC032E920623211DE7338daB7", // kARS
  "0xe27c09186FE9Cf66CB140C8D3099B18c7D8F4b28", // kAUD
  "0x4C13df032e236cC8b7CDe5da8c7A54E28f227a75", // kBDT
  "0xa27e33E190cDc2B4aee4B104dD40d1E8ad59dE00", // kBRL
  "0xBdf50f954c7c0e552C2F28F4108c71035595c67C", // kCAD
  "0x9C35fF27413E8C80AA967CDD4b7e18eb4Fa92F23", // kCHF
  "0x411d6e4A9b08cd88bF5d125477AAEd561da19a69", // kCNH
  "0xdE5F4200ba792C740454768433f4Ed9814E87766", // kEGP
  "0xaC6cC1b7831Ef506dd33272a86C910D4b61785c7", // kEUR
  "0x2457C93774fe7aeb68CA04Cc23100744fF67d073", // kGBP
  "0x262c170f0FaeAb5C6500e482fFEB2Aa16a914E35", // kGHS
  "0xC332Af66D90522eF9e849f815546d37cEeF6Dba4", // kHKD
  "0xC6C5eC266441851BdA6FaDDe97b1956734D76FE2", // kIDR
  "0x5f5b15aD1b1821F353DaF2769d8aB46A2f66D961", // kILS
  "0x21879cb835fB2E6E0cb8Ee685B900904A1323db5", // kINR
  "0xC423b4850f9D918692d23b5DA9F34C149EB1b4c4", // kJPY
  "0xbbA8911eC8eE0E98bc04DC486291c55B5FC3c301", // kKES
  "0xA24C43e46615B257eD13b1beB935DCe5b14843d3", // kKRW
  "0x076e2765EfBE9B168f3E381CaF65234b8FdfC204", // kMXN
  "0x3969DCe50b9097DCcDa1be83155EB516c8e41d04", // kMYR
  "0xa767a6f5f870454F9D6212B9Ae2649C302b9eB25", // kNGN
  "0x3Fd32823Def288F77236e1aD381aa9E47424e82A", // kNOK
  "0x1FDF84fBf5C747B5Ed35f64c8b2dFd373EbA346f", // kNZD
  "0xe23CEC204f276660E3471F4fB74ecEdAbD6e9bF9", // kPHP
  "0xF6391c4B7a0339A9805AB21ef945ac0B188cdCeb", // kPKR
  "0x1398F7EF202A66836ed64da76d0a25aF3Df68A4C", // kPLN
  "0x4AEaFC61bD45B6653E29093DfD67AfC552F42d9f", // kSAR
  "0xe9b37dBCDEC77170BCc14819F5Fd908bA54799aa", // kSEK
  "0x2D5356693825b5201Dbbb92eD2D00810613f492a", // kSGD
  "0x432FbC0D1152F841Ba3a5f76e918231C6FB46e4d", // kTHB
  "0xb52a55107158Bf9b8514689115305A69D8466899", // kTRY
  "0xBeBb8636aECc63dfD24C186cEaa180c2521B8205", // kTWD
  "0xf920E47F9b62e221bDEBB08deDf3958b999D8F7F", // kUSD
  "0x621A37dCC037645658c1b634a398D4B49b763a50", // kVND
  "0x53213fc48a79dEA19809577f4dC31C02269DBf4E", // kXAF
  "0x03093E07603a7E36E39C5D78c506c14f06CbF4fe", // kXOF
  "0xFDcB16a2169906FD75606256E7e9cC4FF202088B", // kZAR
];

const chainContracts = {
  base: {
    issued: ["0x6FB09847417e33A1CE75d3B324015D4C0AeF4D61"],
    unreleased: [MM_WALLET, ...BASE_CONVERT_VAULTS],
  },
  arbitrum: {
    issued: ["0x4653092872bE819CdFf244db8a474BBaeAA2B024"],
    unreleased: [MM_WALLET, ...ARBITRUM_CONVERT_VAULTS],
  },
};

const adapter = addChainExports(chainContracts, undefined, {
  decimals: 6,
  pegType: "peggedUSD",
});
export default adapter;
