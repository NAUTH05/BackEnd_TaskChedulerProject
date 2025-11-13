import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
try {
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(
      readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8')
    );
  } catch {
    serviceAccount = JSON.parse(
      readFileSync(join(__dirname, '..', 'taskschedulerproject-15f1b-firebase-adminsdk-fbsvc-c8a71878fe.json'), 'utf8')
    );
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase initialized');
} catch (error) {
  console.log('Using environment variables...');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}
const db = admin.firestore();
export { admin, db };
