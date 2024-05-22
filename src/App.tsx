import { initializeApp } from "firebase/app";
import { EmailAuthProvider, getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import FirebaseAuth from "react-firebaseui/FirebaseAuth";
import "./App.css";
import logo from "./assets/logo.png";

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
initializeApp(firebaseConfig);

// Configure FirebaseUI.
const uiConfig = {
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
  // Popup signin flow rather than redirect flow.
  signInFlow: "popup",
  signInOptions: [
    { provider: EmailAuthProvider.PROVIDER_ID, requireDisplayName: false },
  ],
};

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false); // Local signed-in state.

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = getAuth().onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  if (!isSignedIn) {
    return (
      <div>
        <img src={logo} className="logo" alt="Radish logo" />
        <h1>Radish</h1>
        <p>Please sign in:</p>
        <FirebaseAuth uiConfig={uiConfig} firebaseAuth={getAuth()} />
      </div>
    );
  }

  const { email } = getAuth().currentUser!;
  return (
    <div>
      <img src={logo} className="logo" alt="Radish logo" />
      <h1>Radish</h1>
      <p>
        You are signed in! Here is your email address:{" "}
        <a href={`mailto:${email}`}>{email}</a>
      </p>
      <button onClick={() => getAuth().signOut()}>Sign-out</button>
    </div>
  );
};

export default App;
