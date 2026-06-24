'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Zap, Briefcase, Coins, TrendingUp, Globe, Search, UserCheck } from 'lucide-react'
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
  { value: 'industry',  label: 'Industry',               description: 'B2B SaaS, Dental Clinics, E-commerce', icon: Briefcase },
  { value: 'hiring',    label: 'Hiring Sales Roles',     description: 'SDR, BDR, VP Sales', icon: UserCheck },
  { value: 'funding',   label: 'Recent Funding',         description: 'Any funding round', icon: Coins },
  { value: 'growth',    label: 'Growth Signals',         description: 'New customers, revenue milestones', icon: TrendingUp },
  { value: 'expansion', label: 'Expansion',              description: 'New markets, new offices', icon: Globe },
  { value: 'keyword',   label: 'Keyword Match',          description: 'Mentions sales/outbound needs', icon: Search },
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
        // Show detailed error if available, otherwise fallback to the generic error message
        let errorMessage = result.details ? `${result.error}: ${result.details}` : (result.error ?? 'Discovery failed')
        
        // Format common AI API rate limit errors to be user-friendly
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
          errorMessage = "You're searching a bit too fast! Please wait about 30 seconds for the AI limits to reset before trying again."
        }
        
        throw new Error(errorMessage)
      }

      reset()
      onOpenChange(false)
      if (onSuccess) onSuccess(result)
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
      <DialogContent className="sm:max-w-[760px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5" />
              Run Discovery
            </DialogTitle>
            <DialogDescription className="text-base mt-1.5">
              Find companies that match your ideal customer profile using AI-powered signal detection.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-hidden">
          <div className="px-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6">
              {/* Primary Filters */}
              <div className="space-y-5">
                <h3 className="font-semibold text-foreground text-sm">Primary Filters</h3>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium">
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    placeholder="e.g., B2B SaaS, Dental Clinics, E-comme"
                    className="rounded-lg"
                    {...register('industry')}
                  />
                  {errors.industry && (
                    <p className="text-xs text-destructive">{errors.industry.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Signal Types
                  </Label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {SIGNAL_OPTIONS.map((option) => {
                      const isSelected = selectedSignals.includes(option.value)
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleSignal(option.value)}
                          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? 'border-gray-400 bg-gray-50/50 shadow-sm dark:border-gray-500 dark:bg-gray-800/50'
                              : 'border-border bg-background hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-input bg-background'
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="h-3 w-3"
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
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4 text-foreground/70 shrink-0" />
                              <span className="font-medium text-foreground text-sm">{option.label}</span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-0.5 pl-6">
                              {option.description}
                            </span>
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
              </div>

              {/* Secondary Filters */}
              <div className="space-y-5">
                <h3 className="font-semibold text-foreground text-sm">Secondary Filters</h3>

                <div className="space-y-2">
                  <Label htmlFor="keywords" className="text-sm font-medium">
                    Keywords
                  </Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., outbound sales, pipeline growth"
                    className="rounded-lg"
                    {...register('keywords')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., United States, Europe"
                    className="rounded-lg"
                    {...register('location')}
                  />
                </div>
              </div>
            </div>

            {runError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 mb-6">
                <p className="text-sm text-destructive">{runError}</p>
              </div>
            )}

            {isRunning && (
              <div className="rounded-lg bg-muted px-4 py-3 mb-6">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching the web and analyzing signals with AI. This takes 20–40 seconds...
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-background shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={isRunning}
              onClick={() => handleOpenChange(false)}
              className="rounded-lg px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isRunning} 
              className="rounded-lg px-6 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-gray-200"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" fill="currentColor" />
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

