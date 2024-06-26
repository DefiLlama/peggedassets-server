const chainContracts = {
  ethereum: {
    issued: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
    unreleased: [
      "0x264bd8291fAE1D75DB2c5F573b07faA6715997B5", //
      "0xE25a329d385f77df5D4eD56265babe2b99A5436e", // paxosTreasury
    ],
  },
  solana: {
    issued: ["2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo"],
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
