import { wrapScheduledLambda } from "./utils/shared/wrap";
import peggedAssets from "./peggedData/peggedData";
import invokeLambda from "./utils/shared/invokeLambda";

function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const step = 10;
const handler = async () => {
  const peggedIndexes = Array.from(Array(peggedAssets.length).keys());
  //shuffleArray(peggedIndexes);
  for (let i = 0; i < peggedAssets.length; i += step) {
    const event = {
      peggedIndexes: peggedIndexes.slice(i, i + step),
    };
    await invokeLambda(`cocoahomology-dev-storePeggedAssets`, event);
  }
};

export default wrapScheduledLambda(handler);
