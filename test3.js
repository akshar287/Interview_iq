const fetch = require('node-fetch');

async function run() {
  try {
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "python",
        version: "3.10.0",
        files: [{ content: "print('Running on EMKC Node!')" }],
      }),
    });
    console.log(res.status, res.statusText);
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

run();
