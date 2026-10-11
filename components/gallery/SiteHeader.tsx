import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-[1400px] px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="font-display text-lg italic tracking-tight text-ink hover:text-accent"
        >
          Tarun / Visual Works
        </Link>
      </div>
    </header>
  );
}
