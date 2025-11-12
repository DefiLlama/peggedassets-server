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
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedEUR' });
  export default adapter;