'use client'

import { ArrowUpDown, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import IntentBadge from './IntentBadge'
import SignalTags from './SignalTags'

export function getColumns({ onDelete, onRowClick }) {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 text-xs font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Company
          <ArrowUpDown className="ml-1.5 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const company = row.original
        return (
          <div
            className="flex flex-col gap-0.5 cursor-pointer"
            onClick={() => onRowClick(company)}
          >
            <span className="text-sm font-medium text-foreground hover:underline">
              {company.name}
            </span>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                {company.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'industry',
      header: () => <span className="text-xs font-medium">Industry</span>,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue('industry') ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'stage',
      header: () => <span className="text-xs font-medium">Stage</span>,
      cell: ({ row }) => {
        const stage = row.getValue('stage')
        if (!stage) return <span className="text-sm text-muted-foreground">—</span>
        return (
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize">
            {stage}
          </span>
        )
      },
    },
    {
      accessorKey: 'intentScore',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 text-xs font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Intent Score
          <ArrowUpDown className="ml-1.5 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <IntentBadge score={row.getValue('intentScore')} />,
      sortingFn: 'basic',
    },
    {
      accessorKey: 'signals',
      header: () => <span className="text-xs font-medium">Signals</span>,
      cell: ({ row }) => <SignalTags signals={row.getValue('signals') ?? []} />,
      enableSorting: false,
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => {
        const company = row.original
        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(company.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )
      },
      enableSorting: false,
    },
  ]
}
