import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-5 text-center">
      <p className="font-display text-xl italic text-ink">This work couldn't be found.</p>
      <Link href="/" className="text-sm text-accent hover:underline">
        Back to the gallery
      </Link>
    </main>
  );
}
