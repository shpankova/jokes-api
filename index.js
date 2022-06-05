const { Worker } = require('worker_threads');
const fs = require("fs");
const readline = require("readline");

async function runWorkers() {
  const fileStream = fs.createReadStream("./instruction.txt");

  const readlineAsyncIterator = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const row of readlineAsyncIterator) {
    const argv = row.split(' ').map(_ => _.replace(/['"]+/g, ''));

    new Worker('./httpRequest.js', { argv });
  }
}

runWorkers().then(() => console.log("all done")).catch(err => console.error(err))
