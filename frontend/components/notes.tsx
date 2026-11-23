"use client";

import { useData } from "@/components/data-provider";
import { NotesList } from "@/components/notes-list";
import { Section } from "@/components/section";
import { SectionSkeleton } from "@/components/states";

/** Notes for the overview page, which loads data.json in the browser. */
export function NotesSection() {
  const data = useData();
  if (data) return <NotesList notes={data.notes} />;
  return (
    <Section id="notes" eyebrow="Good to know" title="Notes and limits">
      <SectionSkeleton className="h-24 w-full rounded-xl" />
    </Section>
  );
}
