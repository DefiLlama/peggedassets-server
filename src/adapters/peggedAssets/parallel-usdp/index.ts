import { addChainExports } from "../helper/getSupply";
import {ChainContracts,
} from "../peggedAsset.type";

const chainContracts:ChainContracts = {
    ethereum: {
        issued: ["0x9B3a8f7CEC208e247d97dEE13313690977e24459"],
    },
    avax: {
        issued: ["0x9eE1963f05553eF838604Dd39403be21ceF26AA4"],
    },
    arbitrum: {
        issued: ["0x76A9A0062ec6712b99B4f63bD2b4270185759dd5"],
    },
    base: {
        issued: ["0x76A9A0062ec6712b99B4f63bD2b4270185759dd5"],
    },
    bsc: {
        issued: ["0x048C4e07D170eEdEE8772cA76AEE1C4e2D133d5c"],
    },
    ink: {
        issued: ["0x9eE1963f05553eF838604Dd39403be21ceF26AA4"],
    },
    optimism: {
        issued: ["0x90337e484B1Cb02132fc150d3Afa262147348545"],
    },
    xdai: {
        issued: ["0x9eE1963f05553eF838604Dd39403be21ceF26AA4"],
    },
    hyperliquid:{
        issued: ["0xBE65F0F410A72BeC163dC65d46c83699e957D588"],
    },
    sonic:{
        issued: ["0x08417cdb7F52a5021bB4eb6E0deAf3f295c3f182"],
    },
    polygon: {
        issued: ["0x1250304F66404cd153fA39388DDCDAec7E0f1707"],
    },
    sei:{
        issued: ["0x048C4e07D170eEdEE8772cA76AEE1C4e2D133d5c"],
    },
    berachain:{
        issued: ["0x9eE1963f05553eF838604Dd39403be21ceF26AA4"],
    },
    scroll:{
        issued: ["0x9eE1963f05553eF838604Dd39403be21ceF26AA4"],
    },
    unichain:{
        issued: ["0x9eE1963f05553eF838604Dd39403be21ceF26AA4"],
    },
    // tac:{
    //     issued: ["0x4DeF531c3060686948f00EcC7504f2E0b71EDa14"],
    // }
};
  
const adapter = addChainExports(chainContracts);
export default adapter;