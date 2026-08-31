// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAM-kDcGrqcGBitnpeevQ3GZvXSLK0a4xM",
  authDomain: "streampulse-analytics.firebaseapp.com",
  projectId: "streampulse-analytics",
  storageBucket: "streampulse-analytics.firebasestorage.app",
  messagingSenderId: "590084818182",
  appId: "1:590084818182:web:67b2ac0c153c2512500a87",
  measurementId: "G-M5TMMZK4Y9"
};

// Initialize Firebase (safely avoid re-initialization during Next.js SSR / HMR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth Instance
export const auth = getAuth(app);

// Authentication Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const microsoftProvider = new OAuthProvider("microsoft.com");
microsoftProvider.setCustomParameters({ prompt: "select_account" });

// Real Firebase Pop-up Authentication Helpers
export const signInWithFirebaseGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signInWithFirebaseMicrosoft = async () => {
  const result = await signInWithPopup(auth, microsoftProvider);
  return result.user;
};

export const signOutFirebase = async () => {
  await firebaseSignOut(auth);
};

export default app;
