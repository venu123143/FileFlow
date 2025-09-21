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
  Upload,
  FolderPlus,
  Search,
  Activity,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const recentFiles = [
  { name: "Project Proposal.pdf", type: "pdf", size: "2.4 MB", modified: "2 hours ago", icon: FileText, color: "text-red-500", bgColor: "bg-red-50" },
  { name: "Dashboard Mockup.fig", type: "figma", size: "15.2 MB", modified: "4 hours ago", icon: ImageIcon, color: "text-purple-500", bgColor: "bg-purple-50" },
  { name: "Team Meeting.mp4", type: "video", size: "124 MB", modified: "1 day ago", icon: Video, color: "text-blue-500", bgColor: "bg-blue-50" },
  { name: "Brand Assets.zip", type: "archive", size: "45.8 MB", modified: "2 days ago", icon: Archive, color: "text-orange-500", bgColor: "bg-orange-50" },
  { name: "Presentation.pptx", type: "presentation", size: "8.1 MB", modified: "3 days ago", icon: FileText, color: "text-pink-500", bgColor: "bg-pink-50" },
]

const quickStats = [
  { label: "Total Files", value: "1,247", icon: FileText, change: "+12%", color: "from-blue-500 to-blue-600" },
  { label: "Storage Used", value: "45.2 GB", icon: Archive, change: "+2.1 GB", color: "from-purple-500 to-purple-600" },
  { label: "Shared Files", value: "89", icon: Users, change: "+5", color: "from-green-500 to-green-600" },
  { label: "Starred Items", value: "23", icon: Star, change: "+3", color: "from-yellow-500 to-yellow-600" },
]

const fileTypeBreakdown = [
  { type: "Documents", count: 456, size: "12.4 GB", color: "from-blue-500 to-blue-600", icon: FileText, percentage: 35 },
  { type: "Images", count: 234, size: "18.7 GB", color: "from-green-500 to-green-600", icon: ImageIcon, percentage: 28 },
  { type: "Videos", count: 67, size: "8.9 GB", color: "from-purple-500 to-purple-600", icon: Video, percentage: 20 },
  { type: "Audio", count: 123, size: "3.2 GB", color: "from-orange-500 to-orange-600", icon: Music, percentage: 12 },
  { type: "Other", count: 367, size: "2.0 GB", color: "from-gray-500 to-gray-600", icon: Archive, percentage: 5 },
]

const quickActions = [
  { label: "Upload Files", icon: Upload, color: "from-blue-500 to-blue-600", description: "Add new files" },
  { label: "New Folder", icon: FolderPlus, color: "from-green-500 to-green-600", description: "Create folder" },
  { label: "Share Files", icon: Users, color: "from-purple-500 to-purple-600", description: "Share with team" },
  { label: "Search Files", icon: Search, color: "from-orange-500 to-orange-600", description: "Find anything" },
]

export function HomeDashboard() {
  const navigate = useNavigate()


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Good morning, Sophie ✨
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">
              Here's what's happening with your files today.
            </p>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={cn(
                    "group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300",
                    "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
                    "hover:bg-white/90 dark:hover:bg-slate-800/90"
                  )}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={cn(
                        "p-3 rounded-xl bg-gradient-to-br",
                        action.color,
                        "group-hover:scale-110 transition-transform duration-300"
                      )}>
                        <action.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                          {action.label}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-br",
                      stat.color,
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Files */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Recent Files
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => navigate('/all-files')}
                >
                  View all
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentFiles.map((file, index) => (
                    <motion.div
                      key={file.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                      whileHover={{ x: 2 }}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 cursor-pointer"
                    >
                      <div className={cn(
                        "p-2.5 rounded-lg",
                        file.bgColor,
                        "group-hover:scale-110 transition-transform duration-200"
                      )}>
                        <file.icon className={cn("h-5 w-5", file.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {file.size} • {file.modified}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {file.type}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Storage Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  Storage Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Storage Used</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">45.2 GB / 100 GB</span>
                  </div>
                  <Progress value={45} className="h-2 bg-slate-200 dark:bg-slate-700">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
                  </Progress>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">54.8 GB remaining</p>
                </div>

                <div className="space-y-4">
                  {fileTypeBreakdown.map((item, index) => (
                    <motion.div
                      key={item.type}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-3 w-3 rounded-full bg-gradient-to-r",
                            item.color
                          )} />
                          <item.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {item.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {item.size}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.count} files
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div
                          className={cn(
                            "h-1.5 rounded-full bg-gradient-to-r",
                            item.color
                          )}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>


      </div>
    </div>
  )
}
