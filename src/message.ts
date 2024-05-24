/** request */
export interface Req {
  code: string;
}

/** response */
export type Resp =
  | { kind: "success"; output: string }
  | { kind: "parse"; message: string }
  | { kind: "error"; message: string }
  | {
      kind: "type";
      /** result of calling `typeof` on function output */
      type: string;
    };
