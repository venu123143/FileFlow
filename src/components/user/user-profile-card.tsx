"use client"

import { motion } from "framer-motion"
import { Mail, MapPin, Calendar } from "lucide-react"
import { UserAvatar } from "./user-avatar"
import { Card, CardContent } from "@/components/ui/card"

interface UserProfileCardProps {
  name?: string
  email?: string
  location?: string
  joinDate?: string
  avatarSrc?: string
  className?: string
}

export function UserProfileCard({
  name = "Sophie Chamberlain",
  email = "hi@sophie.com",
  location = "San Francisco, CA",
  joinDate = "January 2024",
  avatarSrc,
  className,
}: UserProfileCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <UserAvatar src={avatarSrc} size="lg" showStatus status="online" />

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{name}</h3>
                <p className="text-sm text-muted-foreground">Product Designer</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{location}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
