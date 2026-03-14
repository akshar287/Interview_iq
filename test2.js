const fetch = require('node-fetch');

async function run() {
  try {
    const res = await fetch("https://emacsx.piston.rs/api/v2/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "python",
        version: "3.10.0",
        files: [{ content: "print('Working from Server Action proxy!')" }],
      }),
    });
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

run();
