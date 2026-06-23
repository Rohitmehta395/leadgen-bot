'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Topbar from '@/components/layout/Topbar'
import CompaniesTable from '@/components/dashboard/CompaniesTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

// Mock data — will be replaced with real API data in Stage 8
const MOCK_COMPANIES = [
  {
    id: '1',
    name: 'Acme Corp',
    website: 'https://acmecorp.io',
    industry: 'B2B SaaS',
    stage: 'series-a',
    intentScore: 87,
    status: 'new',
    signals: [
      { id: 's1', type: 'hiring', description: 'Hiring 4 SDRs and a VP Sales' },
      { id: 's2', type: 'funding', description: 'Raised $8M Series A in Oct 2024' },
    ],
  },
  {
    id: '2',
    name: 'GrowthBase',
    website: 'https://growthbase.com',
    industry: 'Marketing Tech',
    stage: 'seed',
    intentScore: 72,
    status: 'new',
    signals: [
      { id: 's3', type: 'hiring', description: 'Posting BDR roles on LinkedIn' },
      { id: 's4', type: 'growth', description: 'Announced 3 new enterprise clients' },
    ],
  },
  {
    id: '3',
    name: 'DataPilot',
    website: 'https://datapilot.ai',
    industry: 'AI / Analytics',
    stage: 'series-b',
    intentScore: 65,
    status: 'enriched',
    signals: [
      { id: 's5', type: 'funding', description: 'Raised $22M Series B' },
      { id: 's6', type: 'expansion', description: 'Expanding into EMEA market' },
    ],
  },
  {
    id: '4',
    name: 'Stackly',
    website: 'https://stackly.io',
    industry: 'DevTools',
    stage: 'seed',
    intentScore: 58,
    status: 'new',
    signals: [
      { id: 's7', type: 'keyword', description: 'Website mentions outbound pipeline' },
    ],
  },
  {
    id: '5',
    name: 'RetailOS',
    website: null,
    industry: 'E-commerce',
    stage: 'growth',
    intentScore: 41,
    status: 'new',
    signals: [
      { id: 's8', type: 'growth', description: 'Revenue up 3x, expanding to US' },
    ],
  },
  {
    id: '6',
    name: 'MedFlow',
    website: 'https://medflow.health',
    industry: 'Health Tech',
    stage: 'series-a',
    intentScore: 91,
    status: 'new',
    signals: [
      { id: 's9', type: 'hiring', description: 'Hiring sales team of 6 people' },
      { id: 's10', type: 'funding', description: 'Raised $12M Series A' },
      { id: 's11', type: 'growth', description: 'Signed deal with 3 hospital networks' },
    ],
  },
]

export default function DashboardPage() {
  const [companies, setCompanies] = useState(MOCK_COMPANIES)

  const handleDelete = (id) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id))
    toast.success('Company removed')
  }

  const handleRowClick = (company) => {
    // Company detail sheet will be wired in Stage 9
    toast.info(`Clicked: ${company.name} — detail panel coming in Stage 9`)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Companies">
        <span className="text-xs text-muted-foreground mr-2">
          {companies.length} companies
        </span>
        <Button size="sm" className="gap-1.5" disabled>
          <Plus className="h-3.5 w-3.5" />
          Run Discovery
        </Button>
      </Topbar>

      <div className="flex-1 overflow-auto p-6">
        <CompaniesTable
          data={companies}
          isLoading={false}
          onDelete={handleDelete}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  )
}
