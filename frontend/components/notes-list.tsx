import { Section } from "@/components/section";

/** The notes and limits from data.json, as a section. */
export function NotesList({ notes }: { notes: string[] }) {
  return (
    <Section id="notes" eyebrow="Good to know" title="Notes and limits">
      <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {notes.map((note) => (
          <li key={note} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
            {note}
          </li>
        ))}
      </ul>
    </Section>
  );
}
