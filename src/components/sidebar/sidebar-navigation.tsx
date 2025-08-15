"use client"

import { useState } from "react"
import { Home, FolderOpen, Lock, Users, Trash2, Palette, Bell, Settings } from "lucide-react"
import { SidebarNavItem } from "./sidebar-nav-item"

const navigationItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: FolderOpen, label: "All files", href: "/files" },
  { icon: Lock, label: "Private files", href: "/private" },
  { icon: Users, label: "Shared with me", href: "/shared" },
  { icon: Trash2, label: "Deleted files", href: "/deleted" },
  { icon: Palette, label: "Design", href: "/design" },
  { icon: Bell, label: "Notifications", href: "/notifications", badge: 6 },
  { icon: Settings, label: "Settings", href: "/settings", active: true },
]

export function SidebarNavigation() {
  const [activeItem, setActiveItem] = useState("/settings")

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
          onClick={() => setActiveItem(item.href)}
        />
      ))}
    </nav>
  )
}
