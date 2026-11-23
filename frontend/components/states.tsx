"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataStatus } from "@/components/data-provider";

/** Fixed-height placeholder so content does not jump when data arrives. */
export function SectionSkeleton({ className }: { className: string }) {
  return <Skeleton aria-hidden="true" className={className} />;
}

/** Shown once, above the sections, if data.json cannot be loaded. */
export function DataError() {
  const { status, retry } = useDataStatus();
  if (status !== "error") return null;
  return (
    <div role="alert" className="mt-12 rounded-xl border border-destructive/40 bg-destructive/10 p-5">
      <p className="font-medium">The results could not be loaded.</p>
      <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
      <Button onClick={retry} variant="secondary" className="mt-4 h-11 px-5">
        Try again
      </Button>
    </div>
  );
}
