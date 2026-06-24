'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import CompaniesTable from '@/components/dashboard/CompaniesTable'
import DiscoverDialog from '@/components/discovery/DiscoverDialog'
import CompanySheet from '@/components/company/CompanySheet'
import { Button } from '@/components/ui/button'
import { useCompanies } from '@/hooks/useCompanies'

export default function DashboardPage() {
  const [dialogOpen, setDialogOpen]       = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [sheetOpen, setSheetOpen]         = useState(false)

  const {
    companies,
    total,
    isLoading,
    error,
    fetchCompanies,
    deleteCompany,
  } = useCompanies()

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleDiscoverySuccess = (result) => {
    toast.success(
      `Discovery complete — found ${result.companiesFound} ${
        result.companiesFound === 1 ? 'company' : 'companies'
      }`
    )
    fetchCompanies()
  }

  const handleDelete = async (id) => {
    try {
      await deleteCompany(id)
      // Close sheet if the deleted company is open
      if (selectedCompany?.id === id) {
        setSheetOpen(false)
        setSelectedCompany(null)
      }
      toast.success('Company removed')
    } catch {
      toast.error('Failed to remove company')
    }
  }

  const handleRowClick = (company) => {
    setSelectedCompany(company)
    setSheetOpen(true)
  }

  const handleEnriched = (updatedCompany) => {
    // Update selected company so sheet reflects new data immediately
    setSelectedCompany(updatedCompany)
    // Refresh table so score + status updates in list
    fetchCompanies()
  }

  const handleSheetOpenChange = (val) => {
    setSheetOpen(val)
    if (!val) {
      // Small delay to avoid flash of missing content during close animation
      setTimeout(() => setSelectedCompany(null), 300)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Companies">
        {total > 0 && (
          <span className="text-xs text-muted-foreground mr-2">
            {total} {total === 1 ? 'company' : 'companies'}
          </span>
        )}
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Run Discovery
        </Button>
      </Topbar>

      <div className="flex-1 overflow-auto p-6">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-destructive font-medium">
              Failed to load companies
            </p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={() => fetchCompanies()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <CompaniesTable
            data={companies}
            isLoading={isLoading}
            onDelete={handleDelete}
            onRowClick={handleRowClick}
          />
        )}
      </div>

      <DiscoverDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDiscoverySuccess}
      />

      <CompanySheet
        company={selectedCompany}
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        onEnriched={handleEnriched}
      />
    </div>
  )
}
