import { useEffect, useState } from "react";
import { Editor } from "./Editor";
import { Login } from "./Login";
import { auth } from "./client";

const App = () => {
  const [user, setUser] = useState(auth.currentUser);

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged((newUser) => {
      setUser(newUser);
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  return user === null ? <Login /> : <Editor />;
};

export default App;
