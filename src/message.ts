/** request */
export interface Req {
  code: string;
}

/** response */
export type Resp =
  | { kind: "success"; output: unknown }
  | { kind: "parse"; message: string }
  | { kind: "error"; message: string };
