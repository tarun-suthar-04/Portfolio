// This layout exists specifically to render the @modal parallel-route slot
// alongside the normal page content, per ARCHITECTURE.md §2.3: clicking a
// work from the gallery opens it as an intercepted modal (URL updates to
// /work/[slug], gallery stays mounted behind it); a direct visit to
// /work/[slug] renders the full standalone page instead (see
// app/(public)/work/[slug]/page.tsx).
export default function PublicLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
