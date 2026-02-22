"use client"

import { useState, useEffect } from "react"
import { Video, Image, FileText, Shield } from "lucide-react"
import { SidebarNavItem } from "./sidebar-nav-item"
import { useNavigate, useLocation } from "react-router-dom"

interface NavItem {
  icon: any
  label: string
  href: string
  badge?: number
}

interface AdminSidebarNavigationProps {
  onNavigate?: () => void
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { icon: Video, label: "Videos", href: "/videos" },
  { icon: Image, label: "Images", href: "/images" },
  { icon: FileText, label: "Documents", href: "/documents" },
]

export function AdminSidebarNavigation({ onNavigate }: AdminSidebarNavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()

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

    // Match case 2: nested routes (e.g., /videos)
    const matched = ADMIN_NAV_ITEMS.find(item =>
      pathname === item.href || pathname.startsWith(`${item.href}/`)
    )

    if (matched) {
      setActiveItem(matched.href)
    }
  }, [location.pathname])

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
      <div className="mb-4 pb-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-3">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-sidebar-foreground">Admin</span>
        </div>
      </div>
      {ADMIN_NAV_ITEMS.map((item) => (
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

