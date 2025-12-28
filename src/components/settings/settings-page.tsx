"use client"

import { SettingsHeader } from "./settings-header"
import { SettingsTabs } from "./settings-tabs"
import { SettingsContent } from "./settings-content"
import { useAuth } from "@/contexts/useAuth"
import { useQueryState } from "@/hooks/useQueryState"

export function SettingsPage() {
  const [activeTab, setActiveTab] = useQueryState("tab", (v) => (["general", "security", "pin", "api-token", "sessions"].includes(v || "") ? (v as string) : "general"), (v) => v)
  const { user } = useAuth()
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <SettingsHeader user={user} />
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <SettingsContent activeTab={activeTab} />
    </div>
  )
}
