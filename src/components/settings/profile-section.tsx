"use client"

import { Camera } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Basics</h2>

      <div className="space-y-6">
        {/* Photo Section */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-foreground">Photo</label>
          </div>
          <motion.div className="relative group cursor-pointer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar className="w-16 h-16">
              <AvatarImage src="/professional-blonde-woman.png" alt="Sophie Chamberlain" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Name Section */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-foreground">Name</label>
          </div>
          <div className="text-sm text-foreground font-medium">Sophie C</div>
        </div>

        {/* Email Section */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-foreground">Email address</label>
          </div>
          <div className="text-sm text-foreground font-medium">hi@sophi</div>
        </div>
      </div>
    </div>
  )
}
