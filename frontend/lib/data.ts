"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardData } from "@/lib/types";

type State = { status: "loading" } | { status: "error" } | { status: "ready"; data: DashboardData };

/** Loads /data.json once after first paint. `retry` re-runs the request. */
export function useDashboardData(): State & { retry: () => void } {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/data.json", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`data.json returned ${res.status}`);
        return res.json() as Promise<DashboardData>;
      })
      .then((data) => setState({ status: "ready", data }))
      .catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) setState({ status: "error" });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}
