import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Process the private key to be more resilient
    const formattedKey = privateKey
      ? privateKey
        .replace(/\\n/g, "\n")              // Handle escaped newlines
        .replace(/^"(.*)"$/, "$1")         // Strip leading/trailing double quotes
        .replace(/^'(.*)'$/, "$1")         // Strip leading/trailing single quotes
      : undefined;

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedKey,
      }),
    });
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}

export const { auth, db } = initFirebaseAdmin();
