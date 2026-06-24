'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import CompaniesTable from '@/components/dashboard/CompaniesTable'
import DiscoverDialog from '@/components/discovery/DiscoverDialog'
import { Button } from '@/components/ui/button'
import { useCompanies } from '@/hooks/useCompanies'

export default function DashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    companies,
    total,
    isLoading,
    error,
    fetchCompanies,
    deleteCompany,
    setCompanies,
  } = useCompanies()

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleDiscoverySuccess = (result) => {
    toast.success(
      `Discovery complete — found ${result.companiesFound} ${
        result.companiesFound === 1 ? 'company' : 'companies'
      }`
    )
    // Refresh the table to include newly discovered companies
    fetchCompanies()
  }

  const handleDelete = async (id) => {
    try {
      await deleteCompany(id)
      toast.success('Company removed')
    } catch {
      toast.error('Failed to remove company')
    }
  }

  const handleRowClick = (company) => {
    // Company detail sheet will be wired in Stage 9
    toast.info(`${company.name} — detail panel coming in Stage 9`)
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
    </div>
  )
}
