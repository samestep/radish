import React from "react";
import ReactDOM from "react-dom";
import App from "./App.tsx";
import { auth } from "./client";
import "./main.css";

let started = false;

// check whether the user is signed in before starting
const unregisterAuthObserver = auth.onAuthStateChanged(() => {
  if (!started) {
    started = true;
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById("root"),
    );
  }
});

// immediately unregister because the above should only run once
unregisterAuthObserver();
