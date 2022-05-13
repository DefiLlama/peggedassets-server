import { baseIconsUrl } from "../constants";
import type { Protocol } from "./types";
import data2 from "./data2";

export type { Protocol };
/* Audits: Please follow this legend
0 -> No audits
1 -> Part of this protocol may be unaudited
2 -> Yes
3 -> This protocol is a fork of an existing audited protocol
*/

/*
`chain` is the first chain of a protocol we tracked at defillama,
  so if a protocol launches on Ethereum and we start tracking it there, and then it launches on polygon and
  we start tracking it on both polygon and ethereum, then `chain` should be set to `Ethereum`.

`chains` is not used by the current code, but good to fill it out because it is used in our test to detect errors
*/

export default [
  {
    id: "1",
    name: "StakeHound",
    address: "0x160b1e5aabfd70b2fc40af815014925d71ceed7e",
    symbol: "-",
    url: "https://stakehound.com/",
    description: "Liquid staking provider.",
    chain: "Ethereum",
    logo: `${baseIconsUrl}/stakehound.png`,
    audits: "2",
    audit_note: null,
    gecko_id: "stakehound",
    cmcId: "7566",
    category: "Liquid Staking",
    chains: ["Ethereum"],
    module: "stakehound/index.js",
    twitter: "stakedTokens",
    audit_links: [
      "https://stakehound.com/wp-content/uploads/2020/12/StakeHound-Quantstamp-audit-report.pdf",
    ],
  },
  {
    id: "2",
    name: "ShibaSwap",
    address: "0x9813037ee2218799597d83d4a5b6f3b6778218d9",
    symbol: "BONE",
    url: "https://shibaswap.com",
    description:
      "SHIB, LEASH, and BONE, come together to create ShibaSwap, the next evolution in DeFi platforms. ShibaSwap gives users the ability to DIG (provide liquidity), BURY (stake), and SWAP tokens to gain WOOF Returns through our sophisticated and innovative passive income reward system.",
    chain: "Ethereum",
    logo: `${baseIconsUrl}/shibaswap.jpg`,
    audits: "2",
    audit_note: null,
    gecko_id: "bone-shibaswap",
    cmcId: "11865",
    category: "Dexes",
    chains: ["Ethereum"],
    module: "shibaswap/index.js",
    twitter: "Shibtoken",
    audit_links: ["https://www.certik.org/projects/shib"],
    forkedFrom: ["Uniswap"],
  },
] as Protocol[];
