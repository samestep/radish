import { javascript } from "@codemirror/lang-javascript";
import interact from "@replit/codemirror-interact";
import CodeMirror from "@uiw/react-codemirror";
import * as FlexLayout from "flexlayout-react";
import { useCallback, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import ts from "typescript";
import styles from "./Editor.module.css";
import example from "./assets/example?raw";
import logo from "./assets/logo.png";
import { auth, getDownloadURL, uploadString, userFileRef } from "./client";
import * as colors from "./colors";
import { useNow, useResource } from "./hooks";
import { Req, Resp } from "./message";
import { render } from "./render";
import RawWorker from "./worker?worker";

class EvalWorker {
  private worker = new RawWorker();
  private working = false;
  private queue: Req | undefined = undefined;

  onmessage: ((r: Resp) => void) | undefined = undefined;

  constructor() {
    this.worker.onmessage = (e: MessageEvent<Resp>) => {
      if (this.queue === undefined) {
        this.working = false;
      } else {
        this.worker.postMessage(this.queue);
        this.queue = undefined;
      }
      if (this.onmessage !== undefined) {
        this.onmessage(e.data);
      }
    };
  }

  request(message: Req) {
    if (this.working) {
      this.queue = message;
    } else {
      this.working = true;
      this.worker.postMessage(message);
    }
  }
}

const minutesAgo = ({ then, now }: { then: Date; now: Date }) => {
  const minutes = Math.round((now.getTime() - then.getTime()) / 60000);
  if (minutes <= 0) return "just now";
  else if (minutes === 1) return "1 minute ago";
  else return `${minutes} minutes ago`;
};

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

interface Saved {
  date: Date;
  code: string;
}

interface SaveProps {
  saved: Saved | undefined;
  current: string;
  save: () => void;
}

const Save = ({ saved, current, save }: SaveProps) => {
  const now = useNow({ ms: 60000 });
  const isSaved = saved === undefined || saved.code === current;
  const lastSavedString = isSaved
    ? ""
    : `last saved ${minutesAgo({ then: saved.date, now })}`;
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

interface OutputProps {
  resp: Resp;
}

const Output = ({ resp }: OutputProps) => {
  switch (resp.kind) {
    case "success":
      return render(resp.output);
    case "parse":
    case "error":
      return <pre style={{ color: "red" }}>{resp.message}</pre>;
  }
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

export interface EditorProps {
  uid: string;
}

export const Editor = ({ uid }: EditorProps) => {
  const [result, setResult] = useState<Resp>({ kind: "success", output: "" });

  const worker = useResource(() => {
    const worker = new EvalWorker();
    worker.onmessage = (r) => {
      setResult(r);
    };
    return { resource: worker, cleanup: () => {} };
  }, []);

  const [saved, setSaved] = useState<Saved | undefined>(undefined);
  const [code, setCode] = useState("");

  const update = useCallback(
    (code: string) => {
      setCode(code);
      worker.request({
        code: ts.transpileModule(code, {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.React,
          },
        }).outputText,
      });
    },
    [worker],
  );

  useEffect(() => {
    getDownloadURL(userFileRef(uid)).then(
      async (url) => {
        const response = await fetch(url);
        const date = new Date(response.headers.get("Last-Modified") as string);
        const code = await response.text();
        setSaved({ date, code });
        update(code);
      },
      () => {
        const code = example;
        setSaved({ date: new Date(), code });
        update(code);
      },
    );
  }, [uid, update]);

  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });

  useEffect(() => {
    model.doAction(
      FlexLayout.Actions.updateModelAttributes({
        rootOrientationVertical: isPortrait,
      }),
    );
  }, [isPortrait]);

  const factory = (node: FlexLayout.TabNode) => {
    const { width, height } = node.getRect();
    switch (node.getComponent()) {
      case "workspace":
        return <Workspace />;
      case "code": {
        if (saved === undefined) return <></>;
        return (
          <CodeMirror
            width={`${width}px`}
            height={`${height}px`}
            theme="dark"
            extensions={[
              javascript({ jsx: true, typescript: true }),
              interact({
                rules: [
                  {
                    regexp: /-?\b\d+\.?\d*\b/g,
                    cursor: "ew-resize",
                    onDrag: (text, setText, e) => {
                      // TODO: size aware
                      // TODO: small interval with shift key?
                      const newVal = Number(text) + e.movementX;
                      if (isNaN(newVal)) return;
                      setText(newVal.toString());
                    },
                  },
                ],
              }),
            ]}
            onChange={(value) => {
              update(value);
            }}
            value={saved.code}
          />
        );
      }
      case "output":
        return (
          <div
            style={{
              margin: 0,
              padding: "20px",
              width: "100%",
              height: "100%",
              backgroundColor: colors.background,
            }}
          >
            <Output resp={result} />
          </div>
        );
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
          saved,
          current: code,
          save: async () => {
            await uploadString(userFileRef(uid), code);
            setSaved({ date: new Date(), code });
          },
        }}
      />
      <div style={{ position: "relative", flex: 1 }}>
        <FlexLayout.Layout model={model} factory={factory} />
      </div>
    </div>
  );
};
