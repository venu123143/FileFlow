"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showStatus?: boolean
  status?: "online" | "offline" | "away" | "busy"
  interactive?: boolean
  onClick?: () => void
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
}

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
}

export function UserAvatar({
  src = "/professional-blonde-woman.png",
  alt = "User avatar",
  fallback = "SC",
  size = "md",
  className,
  showStatus = false,
  status = "online",
  interactive = false,
  onClick,
}: UserAvatarProps) {
  const AvatarWrapper = interactive ? motion.button : motion.div

  return (
    <AvatarWrapper
      className={cn("relative", interactive && "cursor-pointer")}
      onClick={onClick}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
    >
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={src || "/placeholder.svg"} alt={alt} />
        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">{fallback}</AvatarFallback>
      </Avatar>

      {showStatus && (
        <div
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
            statusColors[status],
          )}
        />
      )}
    </AvatarWrapper>
  )
}
