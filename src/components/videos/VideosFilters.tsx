"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"

type SortOption = 'date-desc' | 'date-asc' | 'size-desc' | 'size-asc' | 'name-asc' | 'name-desc'

interface VideosFiltersProps {
  sortOption: SortOption
  onSortChange: (option: SortOption) => void
}

export function VideosFilters({ sortOption, onSortChange }: VideosFiltersProps) {
  return (
    <div className="flex items-center gap-2 mt-4">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Newest First</SelectItem>
          <SelectItem value="date-asc">Oldest First</SelectItem>
          <SelectItem value="size-desc">Largest First</SelectItem>
          <SelectItem value="size-asc">Smallest First</SelectItem>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

