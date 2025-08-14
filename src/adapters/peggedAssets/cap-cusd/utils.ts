import BigNumber from "bignumber.js";


export const interpretAsDecimals = (value: string | number, decimals: number) => {
    return new BigNumber(value).div(new BigNumber(10).pow(decimals));
}