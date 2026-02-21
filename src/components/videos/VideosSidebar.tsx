"use client"

import { motion } from "framer-motion"
import { Video, Clock, HardDrive, FileVideo } from "lucide-react"
import { cn } from "@/lib/utils"

type Category = 'all' | 'recent' | 'large' | 'small'

interface VideosSidebarProps {
  selectedCategory: Category
  onCategoryChange: (category: Category) => void
}

const categories: { id: Category; label: string; icon: typeof Video }[] = [
  { id: 'all', label: 'All Videos', icon: Video },
  { id: 'recent', label: 'Recent Uploads', icon: Clock },
  { id: 'large', label: 'Large Files', icon: HardDrive },
  { id: 'small', label: 'Small Files', icon: FileVideo },
]

export function VideosSidebar({ selectedCategory, onCategoryChange }: VideosSidebarProps) {
  return (
    <div className="w-full mb-6">
      {/* Tab Design - Works for both Desktop and Mobile */}
      <div className="relative border-b border-border">
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1 sm:mx-0 sm:px-0">
          <nav className="flex space-x-1 min-w-max" aria-label="Video filters">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.id

              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={cn(
                    "group relative flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-transform shrink-0",
                    isActive ? "text-primary scale-110" : "group-hover:scale-105"
                  )} />
                  <span>{category.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeVideoTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}

