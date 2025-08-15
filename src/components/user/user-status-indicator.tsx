"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface UserStatusIndicatorProps {
  status: "online" | "offline" | "away" | "busy"
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const statusConfig = {
  online: {
    color: "bg-green-500",
    label: "Online",
    textColor: "text-green-600",
  },
  offline: {
    color: "bg-gray-400",
    label: "Offline",
    textColor: "text-gray-600",
  },
  away: {
    color: "bg-yellow-500",
    label: "Away",
    textColor: "text-yellow-600",
  },
  busy: {
    color: "bg-red-500",
    label: "Busy",
    textColor: "text-red-600",
  },
}

const sizeClasses = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
}

export function UserStatusIndicator({ status, showLabel = false, size = "md", className }: UserStatusIndicatorProps) {
  const config = statusConfig[status]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div
        className={cn("rounded-full", config.color, sizeClasses[size])}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      {showLabel && <span className={cn("text-sm font-medium", config.textColor)}>{config.label}</span>}
    </div>
  )
}
