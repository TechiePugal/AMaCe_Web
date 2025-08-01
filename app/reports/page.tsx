import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { PageInDevelopment } from "@/components/page-in-development"

export default function ReportsPage() {
  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Reports & Analytics</h1>
      </header>
      <div className="flex-1 p-4 md:p-8">
        <PageInDevelopment
          title="Reports & Analytics Dashboard"
          description="Comprehensive reporting system with charts, graphs, and detailed analytics for manufacturing operations."
          expectedDate="Q2 2025"
        />
      </div>
    </div>
  )
}
