import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfIwQd_KIqgKWe0i8gU3CONNtmynLB5jI",
  authDomain: "radish-diagrams.firebaseapp.com",
  projectId: "radish-diagrams",
  storageBucket: "radish-diagrams.appspot.com",
  messagingSenderId: "688417051443",
  appId: "1:688417051443:web:f0dddc5d06482f5d8b2446",
  measurementId: "G-3RRV9VT63H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
