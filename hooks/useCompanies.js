'use client'

import { useState, useCallback } from 'react'

export function useCompanies() {
  const [companies, setCompanies]   = useState([])
  const [total, setTotal]           = useState(0)
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState(null)

  const fetchCompanies = useCallback(async (filters = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      if (filters.industry)   params.set('industry', filters.industry)
      if (filters.stage)      params.set('stage', filters.stage)
      if (filters.minScore)   params.set('minScore', String(filters.minScore))
      if (filters.signalType) params.set('signalType', filters.signalType)
      if (filters.search)     params.set('search', filters.search)
      if (filters.sortBy)     params.set('sortBy', filters.sortBy)
      if (filters.sortDir)    params.set('sortDir', filters.sortDir)

      params.set('sortBy', filters.sortBy ?? 'intentScore')
      params.set('sortDir', filters.sortDir ?? 'desc')

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
  }, [])

  const deleteCompany = useCallback(async (id) => {
    const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete company')
    setCompanies((prev) => prev.filter((c) => c.id !== id))
    setTotal((prev) => prev - 1)
  }, [])

  return {
    companies,
    total,
    isLoading,
    error,
    fetchCompanies,
    deleteCompany,
    setCompanies,
  }
}
