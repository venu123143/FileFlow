"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
  { id: "pin", label: "PIN" },
  { id: "api-token", label: "API Token" },
  { id: "sessions", label: "Sessions" },
]

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="relative border-b border-border mb-8">
      <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <nav className="flex space-x-8 min-w-max" aria-label="Settings navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors relative",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
