import { addChainExports } from "../helper/getSupply";
import {  PeggedIssuanceAdapter } from "../peggedAsset.type";
import { function_view } from "../helper/aptos";
import { Balances } from "../peggedAsset.type";
import { call as nibiruCall } from "../helper/nibiru";

async function moveSupply(): Promise<Balances> {
  const balances = {} as Balances;
  
  const resp = await function_view({
    functionStr: '0x1::fungible_asset::supply',
    type_arguments: ['0x1::object::ObjectCore'],
    args: [chainContracts.move.issued[0]],
  });
  balances["peggedUSD"] = Number(resp.vec[0]) / 1e8;

  return balances;
}

async function nibiruSupply(): Promise<Balances> {
  const balances = {} as Balances;
  
  const totalSupply = await nibiruCall({
    target: chainContracts.nibiru.issued[0],
    abi: { name: 'totalSupply' }
  });
  
  // Convert from hex to number and divide by 1e18 (assuming 18 decimals)
  balances["peggedUSD"] = parseInt(totalSupply, 16) / 1e18;

  return balances;
}

// Avalon - USDa, use LayerZero OFT (Mint-Burn) Modal to bridge
const chainContracts = {
    ethereum: {
      issued: ["0x8A60E489004Ca22d775C5F2c657598278d17D9c2"],
    },
    bsc: {
      issued: ["0x9356086146be5158E98aD827E21b5cF944699894"],
    },
    taiko: {
      issued: ["0xff12470a969Dd362EB6595FFB44C82c959Fe9ACc"],
    },
    berachain: {
      issued: ["0xff12470a969Dd362EB6595FFB44C82c959Fe9ACc"]
    },
    mantle: {
      issued: ["0x075df695b8E7f4361FA7F8c1426C63f11B06e326"]
    },
    base: {
      issued: ["0x2840f9d9f96321435ab0f977e7fdbf32ea8b304f"]
    },
    era: {
      issued: ["0xB8d7d88D042880aE87Bb61DE2dFFF8441768766D"]
    },
    sei: {
      issued: ["0xff12470a969dd362eb6595ffb44c82c959fe9acc"]
    },
    zircuit: {
      issued: ["0xff12470a969dd362eb6595ffb44c82c959fe9acc"]
    },
    sonic: {
      issued: ["0xff12470a969dd362eb6595ffb44c82c959fe9acc"]
    },
    corn: {
      issued: ["0xff12470a969dd362eb6595ffb44c82c959fe9acc"]
    },
    morph: {
      issued: ["0xff12470a969dd362eb6595ffb44c82c959fe9acc"]
    },
    klaytn: {
      issued: ["0xdc3cf1961b08da169b078f7df6f26676bf6a4ff6"]
    },
    btr: {
      issued: ["0x91bd7f5e328aecd1024e4118ade0ccb786f55db1"]
    },
    bob: {
      issued: ["0x250fC55c82bcE84C991ba25698A142B21cDC778A"]
    },
    move: {
        issued: ["0x48b904a97eafd065ced05168ec44638a63e1e3bcaec49699f6b8dabbd1424650"],
    },
    nibiru: {
        issued: ["0xf4e097E36d2064E2bDCA96e60439f3A369522003"]
    },
  };


const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts),

    move: {
        minted: moveSupply,
    },
    
    nibiru: {
        minted: nibiruSupply,
    }
};

export default adapter;
