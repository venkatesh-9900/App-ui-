import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardNavbar() {
  return (
    <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger/>
    </div>
  )
}
