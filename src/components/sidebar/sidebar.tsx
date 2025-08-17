"use client"
import { SidebarNavigation } from "./sidebar-navigation"
import { FileBrowser } from "./file-browser"

interface SidebarProps {
  isOpen: boolean
}

export function Sidebar({ isOpen }: SidebarProps) {
  return (
    <div className={`h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-80' : 'w-16'
      }`}>
      <div className="flex-1 overflow-y-auto h-full">
        {isOpen ? (
          <>
            <SidebarNavigation />
            <FileBrowser />
          </>
        ) : (
          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">F</span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
