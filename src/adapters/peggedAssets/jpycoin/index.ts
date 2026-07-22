// V2 adapter for JPY Coin (fund-transfer-type JPYC issued by JPYC Inc.)
// Same contract address on all chains.
// Circulating = totalSupply - issuer wallet balance - redemption wallet balance.
// The issuer wallet holds minted-but-not-yet-issued JPYC; the redemption wallet
// holds JPYC returned by users for redemption that has not been burned yet.
const issuerWallets = [
  "0x8549e82239a88f463ab6e55ad1895b629a00def3", // issuer wallet
  "0xb808af91bdc577bfb3f9c91470f3286dd076e5c1", // redemption wallet
];

const chainContracts = {
  ethereum: {
    issued: ["0xe7c3d8c9a439fede00d2600032d5db0be71c3c29"],
    unreleased: issuerWallets,
  },
  avax: {
    issued: ["0xe7c3d8c9a439fede00d2600032d5db0be71c3c29"],
    unreleased: issuerWallets,
  },
  polygon: {
    issued: ["0xe7c3d8c9a439fede00d2600032d5db0be71c3c29"],
    unreleased: issuerWallets,
  },
  klaytn: {
    issued: ["0xe7c3d8c9a439fede00d2600032d5db0be71c3c29"],
    unreleased: issuerWallets,
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, {
  pegType: "peggedJPY",
});
export default adapter;
