"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useDashboardData } from "@/lib/data";
import type { DashboardData } from "@/lib/types";

type Result = ReturnType<typeof useDashboardData>;

const DataContext = createContext<Result | null>(null);

/** Fetches data.json once and shares it with every data section below. */
export function DataProvider({ children }: { children: ReactNode }) {
  return <DataContext value={useDashboardData()}>{children}</DataContext>;
}

function useResult(): Result {
  const result = useContext(DataContext);
  if (!result) throw new Error("Data sections must be rendered inside <DataProvider>");
  return result;
}

/** The loaded data, or null while loading or after an error. */
export function useData(): DashboardData | null {
  const result = useResult();
  return result.status === "ready" ? result.data : null;
}

export function useDataStatus(): Pick<Result, "status" | "retry"> {
  const { status, retry } = useResult();
  return { status, retry };
}
