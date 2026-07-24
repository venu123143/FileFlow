"use client"

import { useState, useMemo, useEffect } from "react"
import { Home, FolderOpen, Lock, Users, Trash2, Bell, Settings } from "lucide-react"
import { SidebarNavItem } from "./sidebar-nav-item"
import { useNavigate, useLocation } from "react-router-dom"
import { useNotifications } from "@/contexts/NotificationContext"

interface NavItem {
  icon: any
  label: string
  href: string
  badge?: number
}

interface SidebarNavigationProps {
  onNavigate?: () => void
}

const BASE_NAV_ITEMS: NavItem[] = [
  { icon: Home, label: "Home", href: "/home" },
  { icon: FolderOpen, label: "All files", href: "/all-files" },
  { icon: Lock, label: "Private files", href: "/private-files" },
  { icon: Users, label: "Shared with me", href: "/shared-files" },
  { icon: Trash2, label: "Deleted files", href: "/deleted-files" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function SidebarNavigation({ onNavigate }: SidebarNavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount } = useNotifications()

  const [activeItem, setActiveItem] = useState<string>("")

  /**
   * Determine the active menu based on current route
   */
  useEffect(() => {
    const pathname = location.pathname

    // Match case 1: exact match (for "/")
    if (pathname === "/") {
      setActiveItem("/")
      return
    }

    // Match case 2: nested routes (e.g., /all-files/123)
    const matched = BASE_NAV_ITEMS.find(item =>
      pathname === item.href || pathname.startsWith(`${item.href}/`)
    )

    if (matched) {
      setActiveItem(matched.href)
    }
  }, [location.pathname])

  /**
   * Add unread count to notification tab dynamically
   */
  const navigationItems = useMemo(() => {
    return BASE_NAV_ITEMS.map(item =>
      item.href === "/notifications"
        ? { ...item, badge: unreadCount || undefined }
        : item
    )
  }, [unreadCount])

  /**
   * Handle sidebar click navigation
   */
  const handleItemClick = (href: string) => {
    setActiveItem(href)
    navigate(href)
    onNavigate?.()
  }

  return (
    <nav className="p-4 space-y-1">
      {navigationItems.map(item => (
        <SidebarNavItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          badge={item.badge}
          active={activeItem === item.href}
          onClick={handleItemClick}
        />
      ))}
    </nav>
  )
}
