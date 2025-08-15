"use client"

import { SettingsHeader } from "./settings-header"
import { SettingsTabs } from "./settings-tabs"
import { EnhancedSettingsContent } from "./enhanced-settings-content"

export function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <SettingsHeader />
      <SettingsTabs />
      <EnhancedSettingsContent />
    </div>
  )
}
