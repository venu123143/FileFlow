"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export function PreferencesSection() {
  const [autoTimeZone, setAutoTimeZone] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState("English")

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Preferences</h2>

      <div className="space-y-6">
        {/* Automatic Time Zone */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-foreground">Automatic time zone</label>
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Switch
              checked={autoTimeZone}
              onCheckedChange={setAutoTimeZone}
              className="data-[state=checked]:bg-blue-600"
            />
          </motion.div>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-foreground">Language</label>
          </div>
          <Button variant="outline" className="w-auto h-auto p-2 gap-2 text-sm bg-transparent">
            <div className="w-5 h-5 rounded-sm overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 60 30">
                <clipPath id="t">
                  <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
                </clipPath>
                <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
              </svg>
            </div>
            <span>Eng</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
