import Topbar from '@/components/layout/Topbar'

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Companies">
        {/* Discovery button will be added in Stage 8 */}
      </Topbar>
      <div className="flex-1 overflow-auto p-6">
        {/* Companies table will be added in Stage 4 */}
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            Companies table coming in Stage 4
          </p>
        </div>
      </div>
    </div>
  )
}
