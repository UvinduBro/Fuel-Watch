import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}"
  );

  if (serviceAccount.project_id) {
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminMessaging = admin.apps.length ? admin.messaging() : null;
export { admin };
