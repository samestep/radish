import { DependencyList, useEffect, useMemo, useState } from "react";

export const useNow = ({ ms }: { ms: number }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, ms);
    return () => clearInterval(interval);
  }, [ms]);
  return now;
};

export interface ResourceResult<T> {
  resource: T;
  cleanup: () => void;
}

export const useResource = <T>(
  initialize: () => ResourceResult<T>,
  dependencies: DependencyList,
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { resource, cleanup } = useMemo(initialize, dependencies);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => cleanup, dependencies);
  return resource;
};
