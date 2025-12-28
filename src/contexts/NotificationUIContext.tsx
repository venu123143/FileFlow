"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { NotificationContainer } from "@/components/custom/notification-popup"
import type { NotificationAttributes } from "./NotificationContext"

interface NotificationUIContextType {
  showNotification: (notification: NotificationAttributes) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationUIContext = createContext<NotificationUIContextType | undefined>(undefined)

export function NotificationUIProvider({ children }: { children: ReactNode }) {
  const [activeNotifications, setActiveNotifications] = useState<NotificationAttributes[]>([])

  const showNotification = useCallback((notification: NotificationAttributes) => {
    setActiveNotifications(prev => {
      // Check if notification already exists
      const exists = prev.some(n => n.id === notification.id)
      if (exists) return prev
      
      // Add new notification to the beginning
      return [notification, ...prev]
    })
  }, [])

  const removeNotification = useCallback((id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setActiveNotifications([])
  }, [])

  const value: NotificationUIContextType = {
    showNotification,
    removeNotification,
    clearAllNotifications
  }

  return (
    <NotificationUIContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={activeNotifications}
        onRemove={removeNotification}
        maxVisible={3}
      />
    </NotificationUIContext.Provider>
  )
}

export function useNotificationUI() {
  const context = useContext(NotificationUIContext)
  if (!context) {
    throw new Error("useNotificationUI must be used within NotificationUIProvider")
  }
  return context
}