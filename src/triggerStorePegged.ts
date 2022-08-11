import { wrapScheduledLambda } from "./utils/shared/wrap";
import peggedAssets from "./peggedData/peggedData";
import invokeLambda from "./utils/shared/invokeLambda";

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const step = 5;
const handler = async () => {
  const peggedIndexes = Array.from(Array(peggedAssets.length).keys());
  shuffleArray(peggedIndexes);
  for (let i = 0; i < peggedAssets.length; i += step) {
    const event = {
      peggedIndexes: peggedIndexes.slice(i, i + step),
    };
    await Promise.all([invokeLambda(`llama-stablecoins-dev-storePeggedAssets`, event), timeout(1000)]);
  }
};

export default wrapScheduledLambda(handler);
