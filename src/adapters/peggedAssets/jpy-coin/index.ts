// The amounts minted on chains and in bridge contracts seem to have no relation to each other.
// Adapter treats each chain separately, subtracts the gnosis multisig address as unreleased, except for ethereum where it also subtracts the large amounts in bridge contracts.
const chainContracts = {
  ethereum: {
    issued: ["0x2370f9d504c7a6e775bf6e14b3f12846b594cd53"],
    unreleased: [
      "0x7a7f371abcab225c8d78341ebabae991f2e18828", // gnosis safe
      "0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf", // polygon bridge
      "0x4e67df0f232c3bc985f8a63326d80ce3d9a40400", // shiden bridge
      "0x88ad09518695c6c3712ac10a214be5109a655671", // gnosis bridge
    ],
  },
  avax: {
    issued: ["0x431d5dff03120afa4bdf332c61a6e1766ef37bdb"],
    unreleased: ["0x7a96b7cf21f543e6d20159112fb7a9e66de4ff4f"],
  },
  polygon: {
    issued: ["0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB"],
    unreleased: ["0x7a7F371aBCab225C8d78341eBabAE991F2e18828"],
  },
  shiden: {
    issued: ["0x431d5dff03120afa4bdf332c61a6e1766ef37bdb"],
    unreleased: ["0xb30B58386F51881024231b06470E6ed6Fe5bD725"],
  },
  astar: {
    issued: ["0x431d5dff03120afa4bdf332c61a6e1766ef37bdb"],
    unreleased: ["0x572BCbBFbd19d6D7D0c80660151a48da6331be2c"], // not sure if this is correct
  },
  xdai: {
    issued: ["0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB"],
    unreleased: ["0xa312f84607Efb1D200C313859156ccC3500189b6"],
  },
}

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedJPY", });
export default adapter;
