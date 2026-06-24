'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Loader2,
  Building2,
  TrendingUp,
  Calendar,
  Info,
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
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
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center gap-2 w-28 shrink-0 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
      {children}
    </h3>
  )
}

export default function CompanyPage({ params }) {
  const router = useRouter()
  // React 19 / Next.js 16 requires unwrapping params with React.use()
  const resolvedParams = use(params)
  const id = resolvedParams.id

  const [company, setCompany] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEnriching, setIsEnriching] = useState(false)

  const fetchCompany = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/companies/${id}`)
      if (!res.ok) throw new Error('Failed to fetch company')
      const data = await res.json()
      setCompany(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCompany()
  }, [id])

  const handleEnrich = async () => {
    if (!company?.website) {
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
      setCompany(data.company)
    } catch (err) {
      toast.error(err.message ?? 'Enrichment failed')
    } finally {
      setIsEnriching(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Loading Company..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Company Not Found" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-destructive mb-2">{error || 'Company not found'}</p>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const stagePill = company.stage ? (
    <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium capitalize">
      {company.stage}
    </span>
  ) : null

  const statusPill = (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
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
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Company Details">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Topbar>

      <div className="flex-1 overflow-auto p-6 bg-muted/20">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header Card */}
          <div className="bg-background border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {company.name}
              </h1>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <IntentBadge score={company.intentScore} />
              <Button
                variant="outline"
                className="gap-2 w-full sm:w-auto"
                onClick={handleEnrich}
                disabled={isEnriching || !company.website}
              >
                {isEnriching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enriching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    {company.status === 'enriched' ? 'Re-Enrich Data' : 'Enrich Data'}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Details & Metadata */}
            <div className="space-y-6">
              <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
                <SectionTitle>Company Profile</SectionTitle>
                <div className="divide-y divide-border/50">
                  <MetaRow icon={Building2} label="Industry"  value={company.industry} />
                  <MetaRow icon={TrendingUp} label="Stage"    value={stagePill} />
                  <MetaRow icon={Info}       label="Status"   value={statusPill} />
                  <MetaRow
                    icon={Calendar}
                    label="Added"
                    value={formatDistanceToNow(new Date(company.createdAt), { addSuffix: true })}
                  />
                </div>
              </div>

              {company.description && (
                <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
                  <SectionTitle>About</SectionTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {company.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: AI Analysis & Signals */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* AI Insight */}
              <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold">AI Analysis</h2>
                </div>
                
                {company.aiSummary && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-foreground mb-2">Executive Summary</h3>
                    <p className="text-[15px] text-muted-foreground leading-relaxed">
                      {company.aiSummary}
                    </p>
                  </div>
                )}

                {company.scoreReason && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2">Intent Score Reasoning</h3>
                    <div className="rounded-lg bg-indigo-50/50 border border-indigo-100 p-4">
                      <p className="text-[15px] text-indigo-900 leading-relaxed">
                        {company.scoreReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Signals */}
              <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Detected Signals</h2>
                  <SignalTags signals={company.signals ?? []} />
                </div>

                {company.signals?.length > 0 ? (
                  <div className="grid gap-4">
                    {company.signals.map((signal) => (
                      <div
                        key={signal.id}
                        className="rounded-lg border border-border bg-muted/10 p-4 transition-colors hover:bg-muted/30 overflow-hidden relative"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                              SIGNAL_STYLES[signal.type] ?? SIGNAL_STYLES.keyword
                            }`}
                          >
                            {SIGNAL_LABELS[signal.type] ?? signal.type}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDistanceToNow(new Date(signal.detectedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-[15px] text-foreground leading-relaxed mb-3">
                          {signal.description}
                        </p>
                        {signal.source && (
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground border-t border-border/50 pt-3 mt-1">
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            {signal.source.startsWith('http') ? (
                              <a
                                href={signal.source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="break-all hover:text-foreground hover:underline"
                              >
                                {signal.source}
                              </a>
                            ) : (
                              <span className="break-all">Source: {signal.source}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No signals detected yet.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
