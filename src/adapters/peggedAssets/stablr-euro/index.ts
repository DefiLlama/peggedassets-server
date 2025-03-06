const chainContracts = {
    ethereum: {
      issued: ["0x50753CfAf86c094925Bf976f218D043f8791e408", "0xdaC306D72f48dbaD805a11CBf7A512A277C084C9"],
    },
    solana: {
      issued: ["HViRSvsTpwubWHevjSPxNB22Fg3kdzXtedfQXmMoHtoZ"],
    }
  };
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts, undefined, {pegType: "peggedEUR"});
  export default adapter;
  