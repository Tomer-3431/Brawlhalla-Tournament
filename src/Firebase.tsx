// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// const adminAcoount = JSON.parse(import.meta.env.VITE_ADMIN_PRIVATE_KEY!);

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "leaderboard-3431.firebaseapp.com",
  projectId: "leaderboard-3431",
  storageBucket: "leaderboard-3431.firebasestorage.app",
  messagingSenderId: "630078712478",
  appId: "1:630078712478:web:31f53b7f193c449866e98f",
  databaseURL: "https://leaderboard-3431-default-rtdb.europe-west1.firebasedatabase.app",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RE_CAPCHA_KEY),
  isTokenAutoRefreshEnabled: true
});
export const db = getDatabase(app);