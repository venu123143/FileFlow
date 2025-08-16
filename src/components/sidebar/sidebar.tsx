"use client"
import { SidebarNavigation } from "./sidebar-navigation"
import { FileBrowser } from "./file-browser"

export function Sidebar() {
  return (
    <div className="w-70 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="flex-1 overflow-y-auto h-full">
        <SidebarNavigation />
        <FileBrowser />
      </div>
    </div>
  )
}
