'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SIGNAL_OPTIONS = [
  { value: 'hiring',    label: 'Hiring Sales Roles',    description: 'SDR, BDR, VP Sales' },
  { value: 'funding',   label: 'Recent Funding',         description: 'Any funding round' },
  { value: 'growth',    label: 'Growth Signals',         description: 'New customers, revenue milestones' },
  { value: 'expansion', label: 'Expansion',              description: 'New markets, new offices' },
  { value: 'keyword',   label: 'Keyword Match',          description: 'Mentions sales/outbound needs' },
]

const schema = z.object({
  industry: z.string().min(2, 'Industry is required').max(100),
  keywords: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  signalTypes: z
    .array(z.string())
    .min(1, 'Select at least one signal type'),
})

export default function DiscoverDialog({ open, onOpenChange, onSuccess }) {
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError]   = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      industry: '',
      keywords: '',
      location: '',
      signalTypes: ['hiring', 'funding'],
    },
  })

  const selectedSignals = watch('signalTypes') ?? []

  const toggleSignal = (value) => {
    const current = selectedSignals
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    setValue('signalTypes', updated, { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    setIsRunning(true)
    setRunError(null)

    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: data.industry,
          keywords: data.keywords || undefined,
          location: data.location || undefined,
          signalTypes: data.signalTypes,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error ?? 'Discovery failed')
      }

      reset()
      onOpenChange(false)
      onSuccess(result)
    } catch (err) {
      setRunError(err.message)
    } finally {
      setIsRunning(false)
    }
  }

  const handleOpenChange = (val) => {
    if (isRunning) return  // Prevent closing while running
    setRunError(null)
    onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Run Discovery
          </DialogTitle>
          <DialogDescription>
            Find companies that match your ideal customer profile using AI-powered signal detection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
          {/* Industry */}
          <div className="space-y-1.5">
            <Label htmlFor="industry">
              Industry <span className="text-destructive">*</span>
            </Label>
            <Input
              id="industry"
              placeholder="e.g. B2B SaaS, Dental Clinics, E-commerce"
              {...register('industry')}
            />
            {errors.industry && (
              <p className="text-xs text-destructive">{errors.industry.message}</p>
            )}
          </div>

          {/* Signal Types */}
          <div className="space-y-2">
            <Label>
              Signal Types <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {SIGNAL_OPTIONS.map((option) => {
                const isSelected = selectedSignals.includes(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleSignal(option.value)}
                    className={`flex items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <div
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="h-2.5 w-2.5 text-primary-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {option.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.signalTypes && (
              <p className="text-xs text-destructive">
                {errors.signalTypes.message}
              </p>
            )}
          </div>

          {/* Keywords (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="keywords">
              Keywords{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="keywords"
              placeholder="e.g. outbound sales, pipeline growth"
              {...register('keywords')}
            />
          </div>

          {/* Location (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="location">
              Location{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="location"
              placeholder="e.g. United States, Europe"
              {...register('location')}
            />
          </div>

          {/* Error message */}
          {runError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
              <p className="text-xs text-destructive">{runError}</p>
            </div>
          )}

          {/* Running state info */}
          {isRunning && (
            <div className="rounded-md bg-muted px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Searching the web and analyzing signals with AI. This takes 20–40 seconds...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRunning}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isRunning}>
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-3.5 w-3.5" />
                  Run Discovery
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
