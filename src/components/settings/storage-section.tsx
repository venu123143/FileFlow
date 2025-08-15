"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function StorageSection() {
  return (
    <div className="border-t border-border pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Storage</h3>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium">
            Upgrade
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
