import { Req, Resp } from "./message";

const React = {
  createElement: (
    type: string,
    props: Record<string, unknown>,
    ...children: unknown[]
  ) => ({ type, props, children }),
};

const respond = (message: Resp) => postMessage(message);

onmessage = ({ data: { code } }: MessageEvent<Req>) => {
  let f;
  try {
    f = new Function("React", code);
  } catch (e) {
    respond({ kind: "parse", message: `${e}` });
    return;
  }
  let output;
  try {
    output = f(React);
  } catch (e) {
    respond({ kind: "error", message: `${e}` });
    return;
  }
  respond({ kind: "success", output });
};
