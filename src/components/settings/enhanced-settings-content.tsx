"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Camera, Edit3, Save, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InteractiveButton } from "@/components/custom/interactive-button"
import { PageTransition } from "@/components/custom/page-transition"

export function EnhancedSettingsContent() {
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [name, setName] = useState("Sophie C")
  const [email, setEmail] = useState("hi@sophi")
  const [autoTimeZone, setAutoTimeZone] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (field: string) => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    if (field === "name") setIsEditingName(false)
    if (field === "email") setIsEditingEmail(false)
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Profile Section */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-foreground">Basics</h2>

          <div className="space-y-6">
            {/* Photo Section */}
            <motion.div
              className="flex items-center justify-between"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div>
                <label className="text-sm font-medium text-foreground">Photo</label>
              </div>
              <motion.div
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/professional-blonde-woman.png" alt="Sophie Chamberlain" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <motion.div
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Camera className="w-5 h-5 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Name Section */}
            <motion.div
              className="flex items-center justify-between"
              layout
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
              </div>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-32 h-8 text-sm"
                      autoFocus
                    />
                    <InteractiveButton
                      size="sm"
                      onClick={() => handleSave("name")}
                      loading={isSaving}
                      className="h-8 w-8 p-0"
                    >
                      <Save className="w-3 h-3" />
                    </InteractiveButton>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)} className="h-8 w-8 p-0">
                      <X className="w-3 h-3" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div className="flex items-center gap-2 group" whileHover={{ scale: 1.02 }}>
                    <span className="text-sm text-foreground font-medium">{name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingName(true)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Email Section */}
            <motion.div
              className="flex items-center justify-between"
              layout
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div>
                <label className="text-sm font-medium text-foreground">Email address</label>
              </div>
              <div className="flex items-center gap-2">
                {isEditingEmail ? (
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-40 h-8 text-sm"
                      autoFocus
                    />
                    <InteractiveButton
                      size="sm"
                      onClick={() => handleSave("email")}
                      loading={isSaving}
                      className="h-8 w-8 p-0"
                    >
                      <Save className="w-3 h-3" />
                    </InteractiveButton>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingEmail(false)} className="h-8 w-8 p-0">
                      <X className="w-3 h-3" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div className="flex items-center gap-2 group" whileHover={{ scale: 1.02 }}>
                    <span className="text-sm text-foreground font-medium">{email}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingEmail(true)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Linked Accounts Section */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">Linked team account</h3>
            <p className="text-sm text-muted-foreground">
              Easily switch between them and access both accounts from any device.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </motion.div>

            <motion.div
              className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h3.025c.264-3.292 3.016-5.875 6.45-5.875 3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5c-1.833 0-3.49-.76-4.68-1.98L6.5 18.5c1.61 1.48 3.75 2.38 6 2.38 4.97 0 9-4.03 9-9s-4.03-9-9-9z" />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-foreground">Preferences</h2>

          <div className="space-y-6">
            <motion.div
              className="flex items-center justify-between"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
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
            </motion.div>

            <motion.div
              className="flex items-center justify-between"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div>
                <label className="text-sm font-medium text-foreground">Language</label>
              </div>
              <InteractiveButton variant="outline" className="w-auto h-auto p-2 gap-2 text-sm bg-transparent">
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
              </InteractiveButton>
            </motion.div>
          </div>
        </motion.div>

        {/* Storage Section */}
        <motion.div
          className="border-t border-border pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="flex items-center justify-between"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div>
              <h3 className="text-sm font-medium text-foreground">Storage</h3>
            </div>
            <InteractiveButton variant="link" className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium">
              Upgrade
            </InteractiveButton>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
