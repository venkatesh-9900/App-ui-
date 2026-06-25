"use client"

import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  FolderCode,
  LogOut,
  Sparkles,
  BookOpen,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { userInfo, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  // Don't render if not authenticated
  if (!isAuthenticated || !userInfo) {
    return null
  }

  // Get user initials for avatar fallback
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  const handleLogout = async () => {
    await logout()
  }
  
  const handleDeveloperSettings = () => {
    router.push('/developer/api-keys')
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              data-testid="nav-user-trigger"
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userInfo.avatar} alt={userInfo.name || userInfo.email} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(userInfo.name, userInfo.email)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-xs">{userInfo.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userInfo.avatar} alt={userInfo.name || userInfo.email} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(userInfo.name, userInfo.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-xs">{userInfo.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem data-testid="nav-user-developer-settings" className="cursor-pointer" onClick={handleDeveloperSettings}>
                <FolderCode />
                Developer Settings
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="nav-user-billing" className="cursor-pointer">
                <CreditCard />
                Billing
              </DropdownMenuItem>

              {/* Ticket #357
                  Adds quick access to the public API Documentation. */}
              <DropdownMenuItem data-testid="nav-user-documentation" className="cursor-pointer" onClick={() => window.open('https://docs.kernelmind.ai/', '_blank')}>
                <BookOpen />
                API Documentation
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="nav-user-logout" onClick={handleLogout} className="cursor-pointer">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
