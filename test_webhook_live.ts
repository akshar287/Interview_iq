import fs from "fs";

async function testLiveEndpoint() {
    const url = "https://interview-iq-beta.vercel.app/api/vapi/generate";
    const logFile = "test_webhook_result.json";

    console.log(`Pinging live endpoint: ${url}`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: {
                    type: "end-of-call-report",
                    call: {
                        metadata: { userid: "71CFvDt9UZU46wYylizhsvfZgwh1" },
                        variableValues: { role: "Final Test", techstack: "Vercel", type: "technical", level: "Senior" }
                    }
                }
            })
        });

        const status = response.status;
        const body = await response.json();

        const result = {
            timestamp: new Date().toISOString(),
            url,
            status,
            body
        };

        fs.writeFileSync(logFile, JSON.stringify(result, null, 2));
        console.log(`SUCCESS: Status ${status}. Result saved to ${logFile}`);
    } catch (err: any) {
        const errorResult = {
            timestamp: new Date().toISOString(),
            url,
            error: err.message || err
        };
        fs.writeFileSync(logFile, JSON.stringify(errorResult, null, 2));
        console.error(`FAILURE: ${err.message}`);
    }
}

testLiveEndpoint().catch(console.error);
