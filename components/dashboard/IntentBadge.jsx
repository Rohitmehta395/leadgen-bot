import { cn } from '@/lib/utils'

export default function IntentBadge({ score }) {
  const getVariant = (score) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (score >= 50) return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  const getLabel = (score) => {
    if (score >= 80) return 'High'
    if (score >= 50) return 'Medium'
    return 'Low'
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
          getVariant(score)
        )}
      >
        {score}
      </span>
      <span className="text-xs text-muted-foreground">{getLabel(score)}</span>
    </div>
  )
}
