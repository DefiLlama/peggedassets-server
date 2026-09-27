import { addChainExports } from '../helper/getSupply';

// QEURO is minted against collateral and burned on redemption. There is no
// pre-minted issuance reserve. QEURO held by stQEURO remains issued supply;
// the wrapper's own supply is not added again.
export default addChainExports({
  base: {
    issued: ['0x69aD4e6c49d6275D0e11b5515D98a89f029869AA'],
    unreleased: [],
  },
}, undefined, { pegType: 'peggedEUR', decimals: 18 });
