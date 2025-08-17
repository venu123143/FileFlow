"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SidebarNavigation } from "./sidebar-navigation"
import { FileBrowser } from "./file-browser"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <div className={`h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out ${
      isOpen ? 'w-80' : 'w-16'
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
      
      {/* Toggle Button */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="w-full h-8 flex items-center justify-center rounded-md hover:bg-sidebar-hover transition-colors"
          title={isOpen ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
