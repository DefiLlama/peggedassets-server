import { solanaMintedOrBridged } from "../helper/getSupply";
import {
    PeggedIssuanceAdapter
} from "../peggedAsset.type";

const pegType = "peggedREAL";

const chainContracts = {
    ethereum: {
        issued: "0x01d33FD36ec67c6Ada32cf36b31e88EE190B1839", pegType
    },
    polygon: {
        issued: "0x4eD141110F6EeeAbA9A1df36d8c26f684d2475Dc", pegType
    },
    bsc: {
        issued: "0x0295afd3D7E86068050d64509e515f2Db71b4914", pegType
    },
    arbitrum: {
        issued: "0xA8940698FdA5A07AbAEf4A5ccDf2f1Bb525B47A2", pegType
    },
    moonbeam: {
        issued: "0x3225edCe8aD30Ae282e62fa32e7418E4b9cf197b", pegType
    },
    avax: {
        issued: "0x05539F021b66Fd01d1FB1ff8E167CdD09bf7c2D0", pegType
    },
    base: {
        issued: "0xE9185Ee218cae427aF7B9764A011bb89FeA761B4", pegType
    },
    xdai: {
        issued: "0x0a06c8354A6CC1a07549a38701eAc205942E3Ac6", pegType
    },
    optimism: {
        issued: "0xE9185Ee218cae427aF7B9764A011bb89FeA761B4", pegType
    },
    rsk: {
        issued: "0x05539F021b66Fd01d1FB1ff8E167CdD09bf7c2D0", pegType
    },
    celo: {
        issued: "0xE9185Ee218cae427aF7B9764A011bb89FeA761B4", pegType
    },
    mantle: {
        issued: "0x05539F021b66Fd01d1FB1ff8E167CdD09bf7c2D0", pegType
    },
    tron: {
        issued: "TYCE84KFUKx4wCevYpBeYWHxPAKzQvgkc9", pegType
    },
    solana: {
        issued:["FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD"], pegType
    },
};

const adapterSolana: PeggedIssuanceAdapter = {
    solana: {
        minted: solanaMintedOrBridged(chainContracts.solana.issued),
    },
};

import { addChainExports } from "../helper/getSupply";

const adapterOthers = addChainExports(chainContracts, undefined, { pegType });

const adapter = { ...adapterOthers, ...adapterSolana };

export default adapter;
