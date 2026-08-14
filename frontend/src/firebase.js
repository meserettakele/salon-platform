import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAr8BTom9z8apHToZEvJfdKO2tpMqCJsCo",
  authDomain: "salon-platform-94e5e.firebaseapp.com",
  projectId: "salon-platform-94e5e",
  storageBucket: "salon-platform-94e5e.firebasestorage.app",
  messagingSenderId: "229483589584",
  appId: "1:229483589584:web:25e0b911712b28aad993d5",
  measurementId: "G-WSFPB3VJK1",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
