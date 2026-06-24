'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import {
  ExternalLink,
  Sparkles,
  Loader2,
  Building2,
  TrendingUp,
  Calendar,
  Info,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import IntentBadge from '@/components/dashboard/IntentBadge'
import SignalTags from '@/components/dashboard/SignalTags'

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

function MetaRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-1.5 w-24 shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  )
}

export default function CompanySheet({ company, open, onOpenChange, onEnriched }) {
  const [isEnriching, setIsEnriching] = useState(false)

  if (!company) return null

  const handleEnrich = async () => {
    if (!company.website) {
      toast.error('No website available to enrich from')
      return
    }

    setIsEnriching(true)
    try {
      const res = await fetch(`/api/companies/${company.id}/enrich`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Enrichment failed')
      }

      toast.success('Company enriched successfully')
      onEnriched(data.company)
    } catch (err) {
      toast.error(err.message ?? 'Enrichment failed')
    } finally {
      setIsEnriching(false)
    }
  }

  const stagePill = company.stage ? (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize">
      {company.stage}
    </span>
  ) : null

  const statusPill = (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
        company.status === 'enriched'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : company.status === 'contacted'
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-muted text-muted-foreground border-border'
      }`}
    >
      {company.status ?? 'new'}
    </span>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {/* Header */}
        <SheetHeader className="pr-12">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-semibold leading-tight">
                {company.name}
              </SheetTitle>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                  <ExternalLink className="h-3 w-3" />
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
            <IntentBadge score={company.intentScore} />
          </div>
          <SheetDescription className="sr-only">
            Company details and signal breakdown for {company.name}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-6">

          {/* Meta */}
          <div className="space-y-2.5">
            <MetaRow icon={Building2} label="Industry"  value={company.industry} />
            <MetaRow icon={TrendingUp} label="Stage"    value={stagePill} />
            <MetaRow icon={Info}       label="Status"   value={statusPill} />
            <MetaRow
              icon={Calendar}
              label="Added"
              value={formatDistanceToNow(new Date(company.createdAt), { addSuffix: true })}
            />
          </div>

          <Separator />

          {/* AI Summary */}
          {company.aiSummary && (
            <>
              <div className="space-y-2">
                <SectionTitle>AI Summary</SectionTitle>
                <p className="text-sm text-foreground leading-relaxed">
                  {company.aiSummary}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Score Reasoning */}
          {company.scoreReason && (
            <>
              <div className="space-y-2">
                <SectionTitle>Score Reasoning</SectionTitle>
                <div className="rounded-md bg-muted px-3 py-2.5">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {company.scoreReason}
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Description */}
          {company.description && (
            <>
              <div className="space-y-2">
                <SectionTitle>About</SectionTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Signals */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionTitle>
                Signals Detected ({company.signals?.length ?? 0})
              </SectionTitle>
              <SignalTags signals={company.signals ?? []} />
            </div>

            {company.signals?.length > 0 ? (
              <div className="space-y-2">
                {company.signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="rounded-md border border-border bg-background p-3 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                          SIGNAL_STYLES[signal.type] ?? SIGNAL_STYLES.keyword
                        }`}
                      >
                        {SIGNAL_LABELS[signal.type] ?? signal.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(signal.detectedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {signal.description}
                    </p>
                    {signal.source && (
                      <p className="text-xs text-muted-foreground truncate">
                        Source: {signal.source}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No signals detected yet.
              </p>
            )}
          </div>

          <Separator />

          {/* Enrich Action */}
          <div className="space-y-2 pb-4">
            <SectionTitle>Enrichment</SectionTitle>
            <p className="text-xs text-muted-foreground">
              {company.website
                ? 'Scrape the company website to update signals, description, and re-score intent.'
                : 'No website available. Add a website URL to enable enrichment.'}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 w-full"
              onClick={handleEnrich}
              disabled={isEnriching || !company.website}
            >
              {isEnriching ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Enriching...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  {company.status === 'enriched' ? 'Re-Enrich' : 'Enrich Company'}
                </>
              )}
            </Button>
            {isEnriching && (
              <p className="text-xs text-muted-foreground text-center">
                Scraping website and analyzing with AI. Takes 10–20 seconds...
              </p>
            )}
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}
