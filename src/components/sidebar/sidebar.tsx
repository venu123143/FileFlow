"use client"
import { SidebarNavigation } from "./sidebar-navigation"
import { FileBrowser } from "./file-browser"
import { X } from "lucide-react"
import { useSwipeGesture } from "@/hooks/useSwipeGesture"

interface SidebarProps {
  isOpen: boolean
  isMobile?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, isMobile = false, onClose }: SidebarProps) {
  const swipeGesture = useSwipeGesture({
    onSwipeLeft: isMobile ? onClose : undefined,
    threshold: 100
  })

  return (
    <div 
      className={`h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out ${
        isMobile 
          ? 'w-80' 
          : isOpen 
            ? 'w-80' 
            : 'w-16'
      }`}
      {...(isMobile ? swipeGesture : {})}
    >
      {/* Mobile header with close button */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-sidebar-foreground">FileFlow</h2>
            <div className="text-xs text-muted-foreground hidden sm:block">
              Swipe left to close
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto h-full sidebar-scroll">
        {isOpen ? (
          <>
            <SidebarNavigation onNavigate={isMobile ? onClose : undefined} />
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
