import CodeMirror from "@uiw/react-codemirror";
import * as FlexLayout from "flexlayout-react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import styles from "./Editor.module.css";
import logo from "./assets/logo.png";
import { auth } from "./client";
import * as colors from "./colors";

const model = FlexLayout.Model.fromJson({
  global: {
    tabEnableClose: false,
    tabEnableRename: false,
    tabSetEnableMaximize: false,
  },
  borders: [],
  layout: {
    type: "row",
    children: [
      {
        type: "tabset",
        weight: 1,
        children: [{ type: "tab", name: "workspace", component: "workspace" }],
      },
      {
        type: "tabset",
        weight: 3,
        children: [{ type: "tab", name: "code", component: "code" }],
      },
      {
        type: "tabset",
        weight: 3,
        children: [{ type: "tab", name: "output", component: "output" }],
      },
    ],
  },
});

const example = "Hello, Radish!";

export const Editor = () => {
  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });

  useEffect(() => {
    model.doAction(
      FlexLayout.Actions.updateModelAttributes({
        rootOrientationVertical: isPortrait,
      }),
    );
  }, [isPortrait]);

  const [code, setCode] = useState(example);

  const factory = (node: FlexLayout.TabNode) => {
    const { width, height } = node.getRect();
    switch (node.getComponent()) {
      case "workspace": {
        const { email } = auth.currentUser!;
        return (
          <div
            style={{
              boxSizing: "border-box",
              height: "100%",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: colors.background,
            }}
          >
            <span style={{ color: colors.light }}>{email}</span>
            <button
              className={styles.signout}
              style={{
                padding: "5px",
                color: colors.light,
                borderRadius: "10px",
                border: `2px solid ${colors.medium}`,
              }}
              onClick={() => auth.signOut()}
            >
              sign out
            </button>
          </div>
        );
      }
      case "code": {
        return (
          <CodeMirror
            width={`${width}px`}
            height={`${height}px`}
            theme="dark"
            onChange={(value) => {
              setCode(value);
            }}
            value={example}
          />
        );
      }
      case "output": {
        return (
          <pre
            style={{
              margin: 0,
              padding: "20px",
              width: "100%",
              height: "100%",
              backgroundColor: colors.background,
            }}
          >
            {code}
          </pre>
        );
      }
    }
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          boxSizing: "border-box",
          width: "100%",
          padding: "10px",
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: colors.background,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={logo} alt="Radish logo" style={{ height: "30px" }} />
          <span
            style={{
              color: colors.radish,
              fontWeight: "bold",
              fontSize: "30px",
            }}
          >
            Radish
          </span>
        </div>
        <a
          className={`fa fa-github fa-2x ${styles.github}`}
          style={{ textDecoration: "none" }}
          href="https://github.com/penrose/radish"
        ></a>
      </div>
      <div style={{ position: "relative", flex: 1 }}>
        <FlexLayout.Layout model={model} factory={factory} />
      </div>
    </div>
  );
};
