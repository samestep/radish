import { ReactElement, createElement } from "react";

export const dom = (element: unknown): HTMLElement => {
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
      const domElem = document.createElementNS(
        "http://www.w3.org/2000/svg",
        elem.type,
      );
      Object.entries(elem.props).forEach(([key, value]) => {
        domElem.setAttribute(key, value);
      });
      elem.children.forEach((child: unknown) => {
        domElem.appendChild(dom(child));
      });
      return domElem;
    }
  }
};

export const react = (element: unknown): ReactElement => {
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
      return createElement(elem.type, elem.props, ...elem.children.map(react));
    }
  }
};
