"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface VideosSearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function VideosSearchBar({ searchQuery, onSearchChange }: VideosSearchBarProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [localQuery, onSearchChange])

  // Sync with external changes
  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search videos..."
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        className="pl-10 pr-10"
      />
      {localQuery && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          onClick={() => setLocalQuery("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

