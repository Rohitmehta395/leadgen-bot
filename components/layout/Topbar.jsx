import { Menu, Zap, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet'
import Link from 'next/link'

export default function Topbar({ title, children }) {
  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="-ml-2 h-9 w-9" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle mobile menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
               <div className="flex h-14 items-center gap-2 border-b border-border px-4">
                 <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                   <Zap className="h-4 w-4 text-primary-foreground" />
                 </div>
                 <SheetTitle className="text-sm font-semibold tracking-tight m-0 p-0 border-0">
                   Lead Intelligence
                 </SheetTitle>
               </div>
               <nav className="flex flex-col gap-1 p-3">
                 <Link
                   href="/dashboard"
                   className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                 >
                   <BarChart3 className="h-4 w-4" />
                   Dashboard
                 </Link>
               </nav>
            </SheetContent>
          </Sheet>
        </div>
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
