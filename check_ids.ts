
import { db } from './firebase/admin';

async function checkData() {
    console.log('--- Checking Feedback Collection ---');
    const feedback = await db.collection('feedback').get();
    console.log('Total feedback docs:', feedback.size);
    feedback.forEach(doc => {
        const data = doc.data();
        console.log(`Feedback Doc: ${doc.id}`);
        console.log(`  - interviewId: ${data.interviewId}`);
        console.log(`  - userId: ${data.userId}`);
        console.log(`  - createdAt: ${data.createdAt}`);
    });

    console.log('\n--- Checking Interviews Collection ---');
    const interviews = await db.collection('interviews').get();
    console.log('Total interviews docs:', interviews.size);
    interviews.forEach(doc => {
        const data = doc.data();
        console.log(`Interview Doc: ${doc.id}`);
        console.log(`  - role: ${data.role}`);
        console.log(`  - userId: ${data.userId}`);
        console.log(`  - finalized: ${data.finalized}`);
    });

    console.log('\n--- Checking Debug Logs ---');
    const logs = await db.collection('vapi_debug_logs').orderBy('receivedAt', 'desc').limit(5).get();
    logs.forEach(doc => {
        const data = doc.data();
        console.log(`Log Doc: ${doc.id} (${data.vapiMessageType})`);
        console.log(`  - interviewId from payload: ${data.payload?.message?.metadata?.interviewId || data.payload?.message?.call?.metadata?.interviewId}`);
        console.log(`  - userId from payload: ${data.payload?.message?.metadata?.userId || data.payload?.message?.call?.metadata?.userId}`);
    });
}

checkData();
