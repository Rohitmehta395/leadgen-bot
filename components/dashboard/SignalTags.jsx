import { cn } from '@/lib/utils'

const SIGNAL_STYLES = {
  hiring:    'bg-blue-100 text-blue-700 border-blue-200',
  funding:   'bg-violet-100 text-violet-700 border-violet-200',
  growth:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  expansion: 'bg-orange-100 text-orange-700 border-orange-200',
  keyword:   'bg-gray-100 text-gray-600 border-gray-200',
}

const SIGNAL_LABELS = {
  hiring:    'Hiring',
  funding:   'Funding',
  growth:    'Growth',
  expansion: 'Expansion',
  keyword:   'Keyword',
}

export default function SignalTags({ signals = [] }) {
  // Deduplicate by type
  const uniqueTypes = [...new Set(signals.map((s) => s.type))]

  if (uniqueTypes.length === 0) {
    return <span className="text-xs text-muted-foreground">No signals</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {uniqueTypes.map((type) => (
        <span
          key={type}
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
            SIGNAL_STYLES[type] ?? SIGNAL_STYLES.keyword
          )}
        >
          {SIGNAL_LABELS[type] ?? type}
        </span>
      ))}
    </div>
  )
}
