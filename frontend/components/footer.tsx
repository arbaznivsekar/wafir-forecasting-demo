export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Built by Arbaz Yasin Nivsekar</p>
        <a
          href="https://www.linkedin.com/in/arbaz-yasin-nivsekar/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          LinkedIn
        </a>
      </div>
    </footer>
  );
}
