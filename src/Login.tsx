import { EmailAuthProvider } from "firebase/auth";
import firebaseui from "firebaseui";
import FirebaseAuth from "react-firebaseui/FirebaseAuth";
import logo from "./assets/logo.png";
import { auth } from "./client";

// Configure FirebaseUI.
const uiConfig: firebaseui.auth.Config = {
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

export const Login = () => {
  return (
    <div style={{ textAlign: "center", fontFamily: "sans-serif" }}>
      <img src={logo} alt="Radish logo" style={{ height: "256px" }} />
      <h1>Radish</h1>
      <p>Please sign in:</p>
      <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
    </div>
  );
};
