"use client"

import { useState } from "react"
import { SettingsHeader } from "./settings-header"
import { SettingsTabs } from "./settings-tabs"
import { SettingsContent } from "./settings-content"
import { useAuth } from "@/contexts/useAuth"
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const { user } = useAuth()
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <SettingsHeader user={user} />
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <SettingsContent activeTab={activeTab} />
    </div>
  )
}
