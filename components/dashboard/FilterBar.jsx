'use client'

import { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STAGE_OPTIONS = [
  { value: 'seed',       label: 'Seed' },
  { value: 'series-a',  label: 'Series A' },
  { value: 'series-b',  label: 'Series B' },
  { value: 'growth',    label: 'Growth' },
  { value: 'enterprise',label: 'Enterprise' },
]

const SIGNAL_OPTIONS = [
  { value: 'hiring',    label: 'Hiring' },
  { value: 'funding',   label: 'Funding' },
  { value: 'growth',    label: 'Growth' },
  { value: 'expansion', label: 'Expansion' },
  { value: 'keyword',   label: 'Keyword' },
]

const EMPTY_FILTERS = {
  search:     '',
  industry:   '',
  stage:      '',
  signalType: '',
  minScore:   '',
}

export default function FilterBar({ onFilterChange }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  const update = (key, value) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    onFilterChange(updated)
  }

  const clearAll = () => {
    setFilters(EMPTY_FILTERS)
    onFilterChange(EMPTY_FILTERS)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pb-4">
      <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

      {/* Search by name */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Search companies..."
          className="h-8 w-44 pl-8 text-sm"
        />
      </div>

      {/* Industry */}
      <Input
        value={filters.industry}
        onChange={(e) => update('industry', e.target.value)}
        placeholder="Industry"
        className="h-8 w-36 text-sm"
      />

      {/* Stage */}
      <Select
        value={filters.stage || 'all'}
        onValueChange={(val) => update('stage', val === 'all' ? '' : val)}
      >
        <SelectTrigger className="h-8 w-32 text-sm">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {STAGE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Signal Type */}
      <Select
        value={filters.signalType || 'all'}
        onValueChange={(val) => update('signalType', val === 'all' ? '' : val)}
      >
        <SelectTrigger className="h-8 w-36 text-sm">
          <SelectValue placeholder="Signal Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Signals</SelectItem>
          {SIGNAL_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Min Score */}
      <div className="relative">
        <Input
          type="number"
          min={0}
          max={100}
          value={filters.minScore}
          onChange={(e) => update('minScore', e.target.value)}
          placeholder="Min score"
          className="h-8 w-24 text-sm"
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground hover:text-foreground px-2"
          onClick={clearAll}
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}
