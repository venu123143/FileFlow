"use client"

import { useState } from "react"
import { ChevronDown, Settings, User, LogOut, Bell, HelpCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { UserAvatar } from "./user-avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/useAuth"
import { useNavigate } from "react-router-dom"
interface UserDropdownProps {
  name?: string
  email?: string
  avatarSrc?: string
}

export function UserDropdown({ name = "Sophie Chamberlain", email = "hi@sophie.com", avatarSrc }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const menuItems = [
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: HelpCircle, label: "Help & Support", href: "/help" },
    { type: "divider" },
    { icon: LogOut, label: "Sign out", href: "/logout", variant: "destructive" },
  ]
  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
    navigate("/login")
  }

  const onClick = async (href: string) => {
    if (href === "/logout") {
      await handleLogout()
    } else {
      setIsOpen(false)
    }
  }
  return (
    <div className="relative">
      <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto" onClick={() => setIsOpen(!isOpen)}>
        <UserAvatar src={avatarSrc} size="sm" />
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">{email}</div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-20"
            >
              <div className="p-2">
                {menuItems.map((item, index) => {
                  if (item.type === "divider") {
                    return <div key={index} className="my-2 border-t border-border" />
                  }

                  const Icon = item.icon!
                  return (
                    <motion.button
                      key={item.href}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${item.variant === "destructive"
                        ? "text-destructive hover:bg-destructive/10"
                        : "text-foreground hover:bg-accent"
                        }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onClick(item.href ?? "")}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
