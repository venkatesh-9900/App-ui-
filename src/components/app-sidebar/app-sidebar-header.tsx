"use client"

import * as React from "react"
import Image from "next/image"
import { Moon, Sun, Lock, Users } from "lucide-react"
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
import { useSpace } from "@/contexts/space-context"
import { useRouter } from "next/navigation"

const PRIVATE_SPACE_VALUE = "__private__"

export function AppSidebarHeader() {
  const { setTheme, theme } = useTheme()
  const { toggleSidebar } = useSidebar()
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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2">
          <SidebarMenuButton
            size="lg"
            onClick={toggleSidebar}
            className="cursor-pointer hover:bg-transparent flex-1 group-data-[collapsible=icon]:justify-center"
          >
            <div className="flex size-8 group-data-[collapsible=icon]:size-8 items-center justify-center overflow-hidden flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Kernel Mind Logo" 
                width={128} 
                height={128}
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">Kernel Mind</span>
            </div>
          </SidebarMenuButton>
          
          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="cursor-pointer h-8 w-8 group-data-[collapsible=icon]:hidden"
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
