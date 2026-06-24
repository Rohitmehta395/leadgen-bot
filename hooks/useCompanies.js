'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDebounce } from './useDebounce'

export function useCompanies() {
  const [companies, setCompanies]   = useState([])
  const [total, setTotal]           = useState(0)
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState(null)
  const [filters, setFilters]       = useState({})

  const debouncedFilters = useDebounce(filters, 300)

  const fetchCompanies = useCallback(async (overrideFilters) => {
    setIsLoading(true)
    setError(null)

    try {
      const activeFilters = overrideFilters ?? debouncedFilters
      const params = new URLSearchParams()

      if (activeFilters.search)     params.set('search', activeFilters.search)
      if (activeFilters.industry)   params.set('industry', activeFilters.industry)
      if (activeFilters.stage)      params.set('stage', activeFilters.stage)
      if (activeFilters.signalType) params.set('signalType', activeFilters.signalType)
      if (activeFilters.minScore)   params.set('minScore', String(activeFilters.minScore))
      if (activeFilters.sortBy)     params.set('sortBy', activeFilters.sortBy)
      if (activeFilters.sortDir)    params.set('sortDir', activeFilters.sortDir)

      const res = await fetch(`/api/companies?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch companies')

      const data = await res.json()
      setCompanies(data.companies)
      setTotal(data.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedFilters])

  // Auto-fetch when debounced filters change
  useEffect(() => {
    fetchCompanies()
  }, [debouncedFilters])

  const deleteCompany = useCallback(async (id) => {
    // Optimistic update — remove from UI immediately
    setCompanies((prev) => prev.filter((c) => c.id !== id))
    setTotal((prev) => Math.max(0, prev - 1))

    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete company')
    } catch (err) {
      // Rollback on failure — re-fetch to restore correct state
      fetchCompanies()
      throw err
    }
  }, [fetchCompanies])

  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  return {
    companies,
    total,
    isLoading,
    error,
    fetchCompanies,
    deleteCompany,
    applyFilters,
    setCompanies,
  }
}

