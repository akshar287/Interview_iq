
import { db } from "@/firebase/admin";
import Link from "next/link";

export default async function DiagPage() {
    const collections = ["interviews", "feedback", "vapi_debug_logs", "users"];
    const stats: any = {};

    for (const col of collections) {
        const snapshot = await db.collection(col).count().get();
        stats[col] = snapshot.data().count;
    }

    const logsSnapshot = await db.collection("vapi_debug_logs")
        .orderBy("receivedAt", "desc")
        .limit(10)
        .get();

    const logs = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return (
        <div className="p-10 font-mono text-xs overflow-auto h-screen bg-slate-900 text-green-400">
            <h1 className="text-2xl mb-5 text-white">System Diagnostic</h1>

            <div className="mb-10 grid grid-cols-4 gap-4">
                {Object.entries(stats).map(([col, count]) => (
                    <div key={col} className="p-4 border border-green-800 rounded">
                        <div className="text-gray-400 uppercase">{col}</div>
                        <div className="text-3xl font-bold">{count as number}</div>
                    </div>
                ))}
            </div>

            <h2 className="text-xl mb-3 text-white underline">Latest Webhook Logs</h2>
            {logs.length === 0 ? (
                <p className="text-gray-500 italic">No logs found. Webhook likely never called.</p>
            ) : (
                <div className="space-y-4">
                    {logs.map((log: any) => (
                        <div key={log.id} className="p-4 border border-green-900 bg-slate-950 rounded relative">
                            <div className="text-xs text-blue-400 mb-2">ID: {log.id} | RECEIVED: {log.receivedAt}</div>
                            <pre className="whitespace-pre-wrap">
                                {JSON.stringify(log.payload, null, 2)}
                            </pre>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-10 p-4 border border-yellow-800 rounded bg-yellow-900/10 text-yellow-500">
                <h3 className="text-lg mb-2 underline">Troubleshooting Tips</h3>
                <ul className="list-disc ml-5 space-y-1">
                    <li>If <b>vapi_debug_logs</b> is 0, Vapi is NOT hitting your server. Check your Server URL in Vapi Dashboard.</li>
                    <li>Check payloads for <b>userid</b>. If it's missing, the dashboard query will fail.</li>
                    <li>Ensure <b>interviews</b> count increases after a call finishes.</li>
                </ul>
            </div>

            <div className="mt-5">
                <Link href="/" className="text-blue-500 hover:underline">Back to Dashboard</Link>
            </div>
        </div>
    );
}
