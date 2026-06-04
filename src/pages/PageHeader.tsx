// Per-screen heading: a mono overline above a display title (matches the
// design reference's scr-head treatment). Built with design tokens only.
export function PageHeader({ overline, title }: { overline?: string; title: string }) {
  return (
    <header className="mb-6">
      {overline && (
        <div className="font-mono text-micro tracking-[0.16em] text-primary uppercase">
          {overline}
        </div>
      )}
      <h1 className="text-h1 font-bold">{title}</h1>
    </header>
  )
}
