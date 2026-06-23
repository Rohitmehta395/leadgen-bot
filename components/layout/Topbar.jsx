export default function Topbar({ title, children }) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
