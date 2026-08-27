// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCw5Q2SGkoJohho6d06TX1YUWH8kiCgJk0",
  authDomain: "leaderboard-3431.firebaseapp.com",
  projectId: "leaderboard-3431",
  storageBucket: "leaderboard-3431.firebasestorage.app",
  messagingSenderId: "630078712478",
  appId: "1:630078712478:web:31f53b7f193c449866e98f",
  databaseURL: "https://leaderboard-3431-default-rtdb.europe-west1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);