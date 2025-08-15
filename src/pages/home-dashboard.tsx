"use client"

import { motion } from "framer-motion"
import {
  Clock,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  TrendingUp,
  Users,
  Star,
  Plus,
  Upload,
  FolderPlus,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useNavigate } from "react-router-dom"

const recentFiles = [
  { name: "Project Proposal.pdf", type: "pdf", size: "2.4 MB", modified: "2 hours ago", icon: FileText },
  { name: "Dashboard Mockup.fig", type: "figma", size: "15.2 MB", modified: "4 hours ago", icon: ImageIcon },
  { name: "Team Meeting.mp4", type: "video", size: "124 MB", modified: "1 day ago", icon: Video },
  { name: "Brand Assets.zip", type: "archive", size: "45.8 MB", modified: "2 days ago", icon: Archive },
  { name: "Presentation.pptx", type: "presentation", size: "8.1 MB", modified: "3 days ago", icon: FileText },
]

const quickStats = [
  { label: "Total Files", value: "1,247", icon: FileText, change: "+12%" },
  { label: "Storage Used", value: "45.2 GB", icon: Archive, change: "+2.1 GB" },
  { label: "Shared Files", value: "89", icon: Users, change: "+5" },
  { label: "Starred Items", value: "23", icon: Star, change: "+3" },
]

const fileTypeBreakdown = [
  { type: "Documents", count: 456, size: "12.4 GB", color: "bg-blue-500", icon: FileText },
  { type: "Images", count: 234, size: "18.7 GB", color: "bg-green-500", icon: ImageIcon },
  { type: "Videos", count: 67, size: "8.9 GB", color: "bg-purple-500", icon: Video },
  { type: "Audio", count: 123, size: "3.2 GB", color: "bg-orange-500", icon: Music },
  { type: "Other", count: 367, size: "2.0 GB", color: "bg-gray-500", icon: Archive },
]

export function HomeDashboard() {
  const navigate = useNavigate()
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Good morning, Sophie</h1>
            <p className="text-muted-foreground">Here's what's happening with your files today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button  variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Upload className="h-6 w-6" />
                Upload Files
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <FolderPlus className="h-6 w-6" />
                New Folder
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Users className="h-6 w-6" />
                Share Files
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {quickStats.map((stat, index) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFiles.map((file, index) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                      <file.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.size} • {file.modified}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Storage Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Storage Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>45.2 GB used of 100 GB</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>

              <div className="space-y-3">
                {fileTypeBreakdown.map((item, index) => (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.5 + index * 0.05 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.size}</p>
                      <p className="text-xs text-muted-foreground">{item.count} files</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
