import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Initialize or reuse Firebase App singleton safely
let appInstance: FirebaseApp;
if (getApps().length > 0) {
  appInstance = getApp();
} else {
  appInstance = initializeApp(
    firebaseConfig.apiKey
      ? firebaseConfig
      : {
          apiKey: "build-placeholder-key",
          projectId: "viyonka-travels",
          authDomain: "viyonka-travels.firebaseapp.com",
          appId: "build-placeholder-app-id",
        }
  );
}

export const app = appInstance;
export const db: Firestore = getFirestore(app);

// Client-side analytics
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {
    // Analytics ignored if blocked or unsupported
  });
}
