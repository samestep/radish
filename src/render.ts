import { ReactElement, createElement } from "react";

export const render = (element: unknown): ReactElement => {
  switch (typeof element) {
    case "undefined":
    case "boolean":
    case "number":
    case "bigint":
    case "string":
    case "symbol":
    case "function":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return element as any;
    case "object": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (element === null) return null as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const elem: any = element;
      return createElement(elem.type, elem.props, ...elem.children.map(render));
    }
  }
};
