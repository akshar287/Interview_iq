
async function test() {
    const url = "https://interview-iq-beta.vercel.app/api/vapi/generate";
    console.log(`Sending test webhook to: ${url}`);
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: {
                    type: "end-of-call-report",
                    call: {
                        metadata: { userid: "71CFvDt9UZU46wYylizhsvfZgwh1" },
                        variableValues: { role: "Manual Test", techstack: "None", type: "technical", level: "Junior" }
                    }
                }
            })
        });
        console.log("Response Status:", res.status);
        const data = await res.json();
        console.log("Response Data:", JSON.stringify(data, null, 2));
    } catch (err: any) {
        console.error("Fetch error:", err.message);
    }
}

test();
