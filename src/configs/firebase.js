import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBz3OvN9SUA-yfvZqnZtWYoMe-MslH3GQs",
  authDomain: "gabay-malvar.firebaseapp.com",
  projectId: "gabay-malvar",
  storageBucket: "gabay-malvar.appspot.com",
  messagingSenderId: "596229987689",
  appId: "1:596229987689:web:3ea4c1e5bf2a863a2071f8",
  measurementId: "G-MSW0DQZWQ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getDatabase(app);