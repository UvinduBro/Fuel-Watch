import * as admin from "firebase-admin";

if (!admin.apps.length) {
  let jsonStr = (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}").trim();
  if (jsonStr.startsWith("'") && jsonStr.endsWith("'")) {
    jsonStr = jsonStr.slice(1, -1);
  }
  
  const serviceAccount = JSON.parse(jsonStr);

  if (serviceAccount.project_id) {
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized successfully.");
  } else {
    console.error("Firebase Admin failed to initialize: Missing project_id in service account JSON.");
  }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminMessaging = admin.apps.length ? admin.messaging() : null;
export { admin };
