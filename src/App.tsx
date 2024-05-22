import { useEffect, useState } from "react";
import { Editor } from "./Editor";
import { Login } from "./Login";
import { auth } from "./client";

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false); // Local signed-in state.

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  return isSignedIn ? <Editor /> : <Login />;
};

export default App;
