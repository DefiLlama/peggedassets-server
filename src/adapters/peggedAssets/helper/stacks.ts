import axios from 'axios'
import {sumSingleBalance} from "./generalUtil";

export const getTotalSupply = async (token: string, decimals: number) => {
  const [deployer, tokenName] = token.split(".")
  const res = await axios.post<{
    okay: boolean,
    result: string,
    cause?: string,
  }>(`https://api.hiro.so/v2/contracts/call-read/${deployer}/${tokenName}/get-total-supply`, {
    sender: deployer,
    arguments: []
  })
  const {result, okay, cause} = res.data;
  if (okay !== true) {
    throw new Error(`Readonly call failed with error: ${cause}`);
  }
  const hex = result.slice(2);
  const paddedHex = hex.length % 2 ? `0${hex}` : hex;
  const array = new Uint8Array(paddedHex.length / 2);
  for (let i = 0; i < array.length; i++) {
    const j = i * 2;
    const hexByte = paddedHex.slice(j, j + 2);
    const byte = Number.parseInt(hexByte, 16);
    if (Number.isNaN(byte) || byte < 0) throw new Error('Invalid byte sequence');
    array[i] = byte;
  }
  const subarray = array.subarray(2, 18)
  let hexStr = '';
  const hexes = Array.from({length: 256}, (_, i) => i.toString(16).padStart(2, '0'));
  for (const u of subarray) {
    hexStr += hexes[u];
  }
  const balance =Number(BigInt(`0x${hexStr}`)) / 10**decimals;
  let balances = {}
  sumSingleBalance(balances, "peggedUSD", balance, "issued", false);
  return balances;
}

