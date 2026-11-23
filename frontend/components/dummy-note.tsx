/** Matches `meta.note` in data.json. Kept here so the note is visible before the data loads. */
export const DUMMY_NOTE = "All data is dummy and results are illustrative.";

export function DummyNote() {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
      {DUMMY_NOTE}
    </p>
  );
}
