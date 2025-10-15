const chainContracts = {
    arbitrum: {
      issued: ["0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF"],
    },
    plasma: {
      bridgedFromArb: ["0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF"],
    },
    ethereum: {
      bridgedFromArb: ["0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF"],
    },
  };

  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;