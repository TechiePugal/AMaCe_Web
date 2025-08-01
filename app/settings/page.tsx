import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { PageInDevelopment } from "@/components/page-in-development"

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">System Settings</h1>
      </header>
      <div className="flex-1 p-4 md:p-8">
        <PageInDevelopment
          title="System Settings & Configuration"
          description="Application settings, user preferences, system configuration, and administrative controls."
          expectedDate="Q1 2025"
        />
      </div>
    </div>
  )
}
