"use client"

import * as React from "react"
import Image from "next/image"
import { Moon, Sun, Lock, Users, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useTheme } from "next-themes"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSpace } from "@/contexts/space-context"
import { useRouter } from "next/navigation"

const PRIVATE_SPACE_VALUE = "__private__"

export function AppSidebarHeader() {
  const { setTheme, theme } = useTheme()
  const { toggleSidebar, setOpen, isMobile, setOpenMobile, state } = useSidebar()
  const [mounted, setMounted] = React.useState(false)
  const { selectedSpace, setSelectedSpace, userGroups, isLoadingGroups } = useSpace()
  const router = useRouter()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSpaceChange = (value: string) => {
    if (value === PRIVATE_SPACE_VALUE) {
      setSelectedSpace(null)
    } else {
      const groupId = parseInt(value, 10)
      const group = userGroups.find((g) => g.id === groupId)
      if (group) {
        setSelectedSpace({ id: group.id, name: group.name })
      }
    }
    router.push('/home')
  }

  const handleLogoClick = () => {
    if (state === "collapsed") {
      if (isMobile) {
        setOpenMobile(true)
      } else {
        setOpen(true)
      }
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2">
          {/* Gemini-style Collapsed Sidebar Logo Container */}
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  onClick={handleLogoClick}
                  className={`cursor-pointer hover:bg-transparent active:bg-transparent flex-1 group-data-[collapsible=icon]:justify-center relative ${state === "collapsed" && !isMobile ? "group/logo" : ""}`}
                  aria-label={state === "collapsed" ? "Open Sidebar" : undefined}
                >
                  <div className="flex items-center justify-center flex-shrink-0 relative transition-all duration-200 size-8 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:bg-background group-data-[collapsible=icon]:shadow-sm group-data-[collapsible=icon]:border group-data-[collapsible=icon]:border-border group-data-[collapsible=icon]:p-1.5">
                    <Image 
                      src="/logo.png" 
                      alt="Kernel Mind Logo" 
                      width={128} 
                      height={128}
                      className={`w-full h-full object-contain transition-opacity duration-200 ease-in-out ${state === "collapsed" && !isMobile ? "opacity-100 group-hover/logo:opacity-0" : ""}`}
                    />
                    {state === "collapsed" && !isMobile && (
                      <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out opacity-0 group-hover/logo:opacity-100 text-foreground">
                        <PanelLeftOpen className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  {/* Dashboard Refinement
                      Shifted 'Kernel Mind' text slightly left (-ml-1) to reduce visual congestion
                      and synced the status dot using standard animate-pulse to coordinate perfectly
                      with the chat navbar conversation indicator. */}
                  <div className="flex flex-1 items-center gap-2 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden -ml-1">
                    <span className="truncate font-semibold tracking-wide">Kernel Mind</span>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0"></div>
                  </div>
                </SidebarMenuButton>
              </TooltipTrigger>
              {state === "collapsed" && !isMobile && (
                <TooltipContent side="right">
                  Open Sidebar
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          
          {mounted && (
            <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="cursor-pointer h-8 w-8"
                  >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSidebar}
                      className="cursor-pointer h-8 w-8"
                    >
                      <PanelLeftClose className="h-4 w-4" />
                      <span className="sr-only">Collapse Sidebar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Collapse Sidebar
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </SidebarMenuItem>

      <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
        <div className="px-2 pt-2">
          <Select
            value={selectedSpace ? String(selectedSpace.id) : PRIVATE_SPACE_VALUE}
            onValueChange={handleSpaceChange}
            disabled={isLoadingGroups}
          >
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue placeholder="Select Space" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PRIVATE_SPACE_VALUE}>
                <div className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  <span>Private</span>
                </div>
              </SelectItem>
              {userGroups.length > 0 && <SelectSeparator />}
              {userGroups.map((group) => (
                <SelectItem key={group.id} value={String(group.id)}>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{group.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
