import { Balances } from "../peggedAsset.type";
import { getCircleSolanaPremint } from "../helper/circleSolanaPremint";

export async function getSolanaUnreleased(mint: string): Promise<Balances> {
  return { peggedEUR: await getCircleSolanaPremint("eurc", mint) };
}
