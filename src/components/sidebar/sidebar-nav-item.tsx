"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SidebarNavItemProps {
  icon: LucideIcon
  label: string
  href: string
  badge?: number
  active?: boolean
  onClick: (href: string) => void
}

export function SidebarNavItem({ icon: Icon, label, href, badge, active, onClick }: SidebarNavItemProps) {
  return (
    <motion.button
      onClick={() => onClick(href)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative sidebar-nav-item",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
        >
          {badge}
        </motion.div>
      )}
    </motion.button>
  )
}
