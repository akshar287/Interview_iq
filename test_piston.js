const fetch = require('node-fetch'); // or just use global fetch if Node 18+

async function run() {
  try {
    const res = await fetch("https://emkc.org/api/v2/piston/runtimes");
    const json = await res.json();
    console.log(json.find(j => j.language === 'python'));
  } catch (e) {
    console.error(e);
  }
}

run();
