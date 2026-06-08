const chainContracts = {
    ethereum: {
      issued: "0x4933a85b5b5466fbaf179f72d3de273c287ec2c2",
    },
    polygon: {
        issued: "0x4933a85b5b5466fbaf179f72d3de273c287ec2c2",
    },
    base: {
        issued: "0x4933a85b5b5466fbaf179f72d3de273c287ec2c2",
    },
    optimism: {
        issued: "0x4933a85b5b5466fbaf179f72d3de273c287ec2c2",
    },
    tempo: {
        issued: "0x20c0000000000000000000009a4a4b17e0dc6651", // EURAU on Tempo Mainnet
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedEUR' });
  export default adapter;