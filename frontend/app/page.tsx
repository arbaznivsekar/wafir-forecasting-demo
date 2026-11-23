import Link from "next/link";
import { DataProvider } from "@/components/data-provider";
import { DummyNote } from "@/components/dummy-note";
import { ShopsGrid } from "@/components/shops-grid";
import { DataError } from "@/components/states";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <DummyNote />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">Shops</h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        Pick a shop to see how much it wasted, what it needs next week, and how its forecast compares with real sales.{" "}
        <Link
          href="/overview"
          className="whitespace-nowrap font-medium text-brand-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          New here? See how it works
        </Link>
      </p>
      <DataProvider>
        <DataError />
        <ShopsGrid />
      </DataProvider>
    </main>
  );
}
