import type { ReactNode } from "react"

// First-run / no-data fallback. Optional numbered steps render the guiding
// "Create your first plan → Add exercises → Log your first session" flow.
export function EmptyState({
  title,
  body,
  steps,
  children,
}: {
  title: string
  body: string
  steps?: string[]
  children?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 text-center shadow-elev-1">
      <h2 className="text-h3 font-semibold">{title}</h2>
      <p className="mt-1 text-body text-muted-foreground">{body}</p>
      {steps && steps.length > 0 && (
        <ol className="mt-5 flex flex-col gap-2 text-left">
          {steps.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-mono text-caption text-primary">
                {i + 1}
              </span>
              <span className="text-body">{step}</span>
            </li>
          ))}
        </ol>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}
