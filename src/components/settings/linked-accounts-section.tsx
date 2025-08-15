"use client"

import { motion } from "framer-motion"

export function LinkedAccountsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-1">Linked team account</h3>
        <p className="text-sm text-muted-foreground">
          Easily switch between them and access both accounts from any device.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <motion.div
          className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </motion.div>

        <motion.div
          className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h3.025c.264-3.292 3.016-5.875 6.45-5.875 3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5c-1.833 0-3.49-.76-4.68-1.98L6.5 18.5c1.61 1.48 3.75 2.38 6 2.38 4.97 0 9-4.03 9-9s-4.03-9-9-9z" />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}
