"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

import { Sidebar } from "@/components/sidebar/sidebar"
import { TopBar } from "@/components/layouts/top-bar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Handle Ctrl+B shortcut at layout level
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        setSidebarOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(prev => !prev)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <TopBar onSidebarToggle={() => setSidebarOpen(prev => !prev)} />
        </motion.div>

        <motion.main
          className="flex-1 overflow-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
