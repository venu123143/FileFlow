"use client"

import type React from "react"
import { motion } from "framer-motion"

import { Sidebar } from "@/components/sidebar/sidebar"
import { TopBar } from "@/components/layouts/top-bar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
      >
        <Sidebar />
      </motion.div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <TopBar />
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
