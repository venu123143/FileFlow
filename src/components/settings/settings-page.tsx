"use client"

import { useState } from "react"
import { SettingsHeader } from "./settings-header"
import { SettingsTabs } from "./settings-tabs"
import { SettingsContent } from "./settings-content"

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <div className="max-w-4xl mx-auto p-8">
      <SettingsHeader />
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <SettingsContent activeTab={activeTab} />
    </div>
  )
}
