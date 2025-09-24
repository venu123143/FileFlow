"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { X, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NotificationAttributes } from "@/contexts/NotificationContext"

interface NotificationPopupProps {
  notification: NotificationAttributes
  onClose?: () => void
  duration?: number
}

export function NotificationPopup({ 
  notification, 
  onClose, 
  duration = 5000 
}: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  const handleClick = () => {
    navigate("/notifications")
    handleClose()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "file_shared":
        return "📁"
      case "file_updated":
        return "📝"
      case "file_upload_completed":
        return "✅"
      case "file_upload_failed":
        return "❌"
      case "file_deleted":
        return "🗑️"
      case "storage_quota_warning":
      case "storage_quota_exceeded":
        return "⚠️"
      case "file_commented":
        return "💬"
      default:
        return "🔔"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "file_upload_failed":
      case "storage_quota_exceeded":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
      case "storage_quota_warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
      case "file_upload_completed":
      case "file_shared":
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
      default:
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "relative w-full transition-all duration-300 ease-in-out transform",
        isExiting 
          ? "translate-x-full opacity-0 scale-95" 
          : "translate-x-0 opacity-100 scale-100"
      )}
      role="alert"
      aria-live="polite"
    >
      <div
        className={cn(
          "relative p-4 rounded-lg border shadow-lg cursor-pointer",
          "hover:shadow-xl transition-shadow duration-200",
          "backdrop-blur-sm bg-white/95 dark:bg-gray-900/95",
          getNotificationColor(notification.type)
        )}
        onClick={handleClick}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Notification content */}
        <div className="flex items-start gap-3 pr-6">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
              {getNotificationIcon(notification.type)}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {notification.title}
              </h4>
              {!notification.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(notification.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Bell className="w-3 h-3" />
                <span>Click to view all</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
          <div className="h-full bg-primary w-full" />
        </div>
      </div>
    </div>
  )
}

// Container component to manage multiple notifications
interface NotificationContainerProps {
  notifications: NotificationAttributes[]
  onRemove: (id: string) => void
  maxVisible?: number
}

export function NotificationContainer({ 
  notifications, 
  onRemove, 
  maxVisible = 3 
}: NotificationContainerProps) {
  const visibleNotifications = notifications.slice(0, maxVisible)

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm pointer-events-none px-4 sm:px-0">
      <div className="pointer-events-auto space-y-2">
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            transform: `translateY(${index * 4}px)`,
            zIndex: 50 - index
          }}
        >
          <NotificationPopup
            notification={notification}
            onClose={() => onRemove(notification.id)}
            duration={5000 + (index * 1000)} // Stagger durations
          />
        </div>
      ))}
      </div>
    </div>
  )
}