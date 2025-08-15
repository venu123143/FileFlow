"use client"

import { motion } from "framer-motion"
import { UserAvatar } from "./user-avatar"
import { UserStatusIndicator } from "./user-status-indicator"

interface UserInfoDisplayProps {
  name?: string
  email?: string
  role?: string
  avatarSrc?: string
  status?: "online" | "offline" | "away" | "busy"
  showStatus?: boolean
  layout?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserInfoDisplay({
  name = "Sophie Chamberlain",
  email = "hi@sophie.com",
  role = "Product Designer",
  avatarSrc,
  status = "online",
  showStatus = true,
  layout = "horizontal",
  size = "md",
  className,
}: UserInfoDisplayProps) {
  const avatarSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "md"

  if (layout === "vertical") {
    return (
      <motion.div
        className={`flex flex-col items-center text-center space-y-3 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <UserAvatar src={avatarSrc} size={avatarSize} showStatus={showStatus} status={status} />

        <div className="space-y-1">
          <h3
            className={`font-semibold text-foreground ${
              size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base"
            }`}
          >
            {name}
          </h3>

          {role && <p className={`text-muted-foreground ${size === "sm" ? "text-xs" : "text-sm"}`}>{role}</p>}

          <p className={`text-muted-foreground ${size === "sm" ? "text-xs" : "text-sm"}`}>{email}</p>

          {showStatus && <UserStatusIndicator status={status} showLabel size={size === "sm" ? "sm" : "md"} />}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <UserAvatar src={avatarSrc} size={avatarSize} showStatus={showStatus} status={status} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={`font-semibold text-foreground truncate ${
              size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base"
            }`}
          >
            {name}
          </h3>

          {showStatus && <UserStatusIndicator status={status} size={size === "sm" ? "sm" : "md"} />}
        </div>

        {role && <p className={`text-muted-foreground truncate ${size === "sm" ? "text-xs" : "text-sm"}`}>{role}</p>}

        <p className={`text-muted-foreground truncate ${size === "sm" ? "text-xs" : "text-sm"}`}>{email}</p>
      </div>
    </motion.div>
  )
}
