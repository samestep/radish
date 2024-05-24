import { Req, Resp } from "./message";

const respond = (message: Resp) => postMessage(message);

onmessage = ({ data: { code } }: MessageEvent<Req>) => {
  let f;
  try {
    f = new Function(code);
  } catch (e) {
    respond({ kind: "parse", message: `${e}` });
    return;
  }
  let output;
  try {
    output = f();
  } catch (e) {
    respond({ kind: "error", message: `${e}` });
    return;
  }
  const type = typeof output;
  respond(
    type === "string" ? { kind: "success", output } : { kind: "type", type },
  );
};
