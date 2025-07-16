const chainContracts = {
    ethereum: {
        issued: ["0x70e8de73ce538da2beed35d14187f6959a8eca96"]
    },
    arbitrum :{
      bridgedFromETH: ["0xe333e7754a2dc1e020a162ecab019254b9dab653"]
    },
    avax :{
      bridgedFromETH: ["0xb2f85b7ab3c2b6f62df06de6ae7d09c010a5096e"]
    },
    polygon: {
      bridgedFromETH: ["0xdc3326e71d45186f113a2f448984ca0e8d201995"]
    },
    zilliqa: {
      issued: ["zil180v66mlw007ltdv8tq5t240y7upwgf7djklmwh"]
    }

};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { decimals: 6});
export default adapter;