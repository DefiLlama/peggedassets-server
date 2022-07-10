import iterate from "./storePegged"

const test = async () => {
    await iterate([1, 5, 38, 44])
    console.log("finished")
  };
  
  test();