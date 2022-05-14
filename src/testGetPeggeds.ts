import { craftProtocolsResponse } from "./getPeggeds";

const test = async () => {
  let res = await craftProtocolsResponse(true, true);
  console.log(res);
};

test();
