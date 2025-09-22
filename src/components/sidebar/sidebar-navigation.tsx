"use client"

import { useState, useMemo } from "react"
import { Home, FolderOpen, Lock, Users, Trash2, Bell, Settings } from "lucide-react"
import { SidebarNavItem } from "./sidebar-nav-item"
import { useNavigate } from "react-router-dom"
import { useNotifications } from "@/contexts/NotificationContext"

// Define base navigation items without dynamic properties
const baseNavigationItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: FolderOpen, label: "All files", href: "/all-files" },
  { icon: Lock, label: "Private files", href: "/private-files" },
  { icon: Users, label: "Shared with me", href: "/shared-files" },
  { icon: Trash2, label: "Deleted files", href: "/deleted-files" },
  { icon: Bell, label: "Notifications", href: "/notifications", badge: 0 },
  { icon: Settings, label: "Settings", href: "/settings" },
]

interface SidebarNavigationProps {
  onNavigate?: () => void
}

export function SidebarNavigation({ onNavigate }: SidebarNavigationProps) {
  const { unreadCount } = useNotifications()
  const [activeItem, setActiveItem] = useState("/settings")
  const navigate = useNavigate()

  // Memoize the navigation items to prevent unnecessary recalculations
  const navigationItems = useMemo(() => {
    return baseNavigationItems.map(item => {
      if (item.href === "/notifications") {
        return {
          ...item,
          badge: unreadCount > 0 ? unreadCount : undefined
        }
      }
      return item
    })
  }, [unreadCount]) // Only recalculate when unreadCount changes

  const navigationItemClick = (href: string) => {
    setActiveItem(href)
    navigate(href)
    // Close sidebar on mobile after navigation
    onNavigate?.()
  }

  return (
    <nav className="p-4 space-y-1">
      {navigationItems.map((item) => (
        <SidebarNavItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          badge={item.badge}
          active={activeItem === item.href}
          onClick={navigationItemClick}
        />
      ))}
    </nav>
  )
}