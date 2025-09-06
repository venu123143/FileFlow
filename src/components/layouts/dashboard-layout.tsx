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
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
      // Auto-close sidebar on mobile by default
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

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

  // Close sidebar when clicking outside on mobile
  const handleBackdropClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="dashboard-layout flex h-screen bg-background overflow-hidden relative">
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm mobile-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
          onClick={handleBackdropClick}
        />
      )}

      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            className={`${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}`}
            initial={{ x: isMobile ? -320 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? -320 : -300, opacity: 0 }}
            transition={{ 
              duration: isMobile ? 0.25 : 0.3, 
              ease: [0.4, 0.0, 0.2, 1] 
            }}
          >
            <Sidebar isOpen={sidebarOpen} isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
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
          className="flex-1 overflow-y-auto h-screen"
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
