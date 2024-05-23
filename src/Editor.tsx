import CodeMirror from "@uiw/react-codemirror";
import * as FlexLayout from "flexlayout-react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import styles from "./Editor.module.css";
import logo from "./assets/logo.png";
import { auth } from "./client";
import * as colors from "./colors";

const useNow = ({ ms }: { ms: number }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, ms);
    return () => clearInterval(interval);
  }, [ms]);
  return now;
};

const minutesAgo = ({ then, now }: { then: Date; now: Date }) => {
  const minutes = Math.round((now.getTime() - then.getTime()) / 60000);
  if (minutes <= 0) return "just now";
  else if (minutes === 1) return "1 minute ago";
  else return `${minutes} minutes ago`;
};

const example = "Hello, Radish!";

const Logo = () => {
  return (
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
  );
};

interface SaveProps {
  lastSaved: undefined | Date;
  saved: string;
  current: string;
  save: () => void;
}

const Save = ({ lastSaved, saved, current, save }: SaveProps) => {
  const now = useNow({ ms: 60000 });
  const isSaved = saved === current;
  const lastSavedString =
    isSaved || lastSaved === undefined
      ? ""
      : `last saved ${minutesAgo({ then: lastSaved, now })}`;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <button
        className={styles[isSaved ? "save-greyed" : "save"]}
        style={{
          height: "100%",
          padding: "5px 10px",
          color: isSaved ? colors.dark : "black",
          borderRadius: "10px",
          border: `2px solid ${colors.dark}`,
        }}
        onClick={
          isSaved
            ? undefined
            : () => {
                save();
              }
        }
      >
        save
      </button>
      <span style={{ color: colors.dark }}>{lastSavedString}</span>
    </div>
  );
};

const GitHub = () => {
  return (
    <a
      className={`fa fa-github fa-2x ${styles.github}`}
      style={{ textDecoration: "none" }}
      href="https://github.com/penrose/radish"
    ></a>
  );
};

interface TopProps {
  saveProps: SaveProps;
}

const Top = ({ saveProps }: TopProps) => {
  const gap = "20px";
  return (
    <div
      style={{
        padding: "10px",
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
        backgroundColor: colors.background,
      }}
    >
      <div style={{ display: "flex", gap }}>
        <Logo />
        <Save {...saveProps} />
      </div>
      <div style={{ display: "flex", gap }}>
        <GitHub />
      </div>
    </div>
  );
};

const Workspace = () => {
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
};

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

export const Editor = () => {
  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });

  useEffect(() => {
    model.doAction(
      FlexLayout.Actions.updateModelAttributes({
        rootOrientationVertical: isPortrait,
      }),
    );
  }, [isPortrait]);

  const [lastSaved, setLastSaved] = useState<undefined | Date>(undefined);
  const [saved, setSaved] = useState(example);
  const [code, setCode] = useState(saved);

  const factory = (node: FlexLayout.TabNode) => {
    const { width, height } = node.getRect();
    switch (node.getComponent()) {
      case "workspace":
        return <Workspace />;
      case "code": {
        return (
          <CodeMirror
            width={`${width}px`}
            height={`${height}px`}
            theme="dark"
            onChange={(value) => {
              setCode(value);
            }}
            value={saved}
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
      <Top
        saveProps={{
          lastSaved: lastSaved,
          saved,
          current: code,
          save: () => {
            setLastSaved(new Date());
            setSaved(code);
          },
        }}
      />
      <div style={{ position: "relative", flex: 1 }}>
        <FlexLayout.Layout model={model} factory={factory} />
      </div>
    </div>
  );
};
