"use client"

import { ExternalLink } from "lucide-react"
import { UserDropdown } from "@/components/user/user-dropdown"

export function TopBar() {
  return (
    <div className="h-16 border-b border-border bg-background px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
        <span className="font-semibold text-foreground">Untitled UI</span>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>v4.0</span>
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>

      <UserDropdown />
    </div>
  )
}
