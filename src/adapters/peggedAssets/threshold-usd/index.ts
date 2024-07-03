const chainContracts = {
    ethereum: {
      issued: ["0xcfc5bd99915aaa815401c5a41a927ab7a38d29cf"],
      unreleased: [
        "0x097f1ee62E63aCFC3Bf64c1a61d96B3771dd06cB", // Protocol Controlled Value
        "0x1a4739509F50E683927472b03e251e36d07DD872", // Protocol Controlled ETH Value
        "0xF6374AEfb1e69a21ee516ea4B803b2eA96d06f29", // Stability Pool
        "0xA18Ab4Fa9a44A72c58e64bfB33D425Ec48475a9f", // Stability Pool ETH
      ],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
  