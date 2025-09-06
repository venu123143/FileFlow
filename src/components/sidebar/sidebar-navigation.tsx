"use client"

import { useState } from "react"
import { Home, FolderOpen, Lock, Users, Trash2, Bell, Settings } from "lucide-react"
import { SidebarNavItem } from "./sidebar-nav-item"
import { useNavigate } from "react-router-dom"

const navigationItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: FolderOpen, label: "All files", href: "/all-files" },
  { icon: Lock, label: "Private files", href: "/private-files" },
  { icon: Users, label: "Shared with me", href: "/shared-files" },
  { icon: Trash2, label: "Deleted files", href: "/deleted-files" },
  { icon: Bell, label: "Notifications", href: "/notifications", badge: 6 },
  { icon: Settings, label: "Settings", href: "/settings", active: true },
]

interface SidebarNavigationProps {
  onNavigate?: () => void
}

export function SidebarNavigation({ onNavigate }: SidebarNavigationProps) {
  const [activeItem, setActiveItem] = useState("/settings")
  const navigate = useNavigate()
  const navigationItemClick = (href: string) => {
    setActiveItem(href);
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
