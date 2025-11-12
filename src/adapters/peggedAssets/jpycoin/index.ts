// V2 adapter for JPY Coin
const chainContracts = {
    ethereum: {
      issued: ["0xe7c3d8c9a439fede00d2600032d5db0be71c3c29"],
      unreleased: [
        "0x8549E82239a88f463ab6E55Ad1895b629a00Def3",
      ],
    },
    avax: {
      issued: ["0xe7c3d8c9a439fede00d2600032d5db0be71c3c29"],
      unreleased: [
        "0x8549E82239a88f463ab6E55Ad1895b629a00Def3",
      ],
    },
    polygon: {
      issued: ["0xe7c3d8c9a439fede00d2600032d5db0be71c3c29"],
      unreleased: [
        "0x8549E82239a88f463ab6E55Ad1895b629a00Def3",
      ],
    },
  }
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedJPY", });
  export default adapter;
  