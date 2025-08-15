"use client"

import { ProfileSection } from "./profile-section"
import { LinkedAccountsSection } from "./linked-accounts-section"
import { PreferencesSection } from "./preferences-section"
import { StorageSection } from "./storage-section"

export function SettingsContent() {
  return (
    <div className="space-y-8">
      <ProfileSection />
      <LinkedAccountsSection />
      <PreferencesSection />
      <StorageSection />
    </div>
  )
}
