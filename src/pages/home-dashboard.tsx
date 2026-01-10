"use client"
import { useState, useMemo } from "react"
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
  Activity,
  Lock,
  RefreshCw,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import RecentFiles from "@/components/file-manager/RecentFiles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/useAuth"
import { ACCESS_LEVEL } from "@/types/file.types"
import { AddNewFolder } from "@/components/file-manager/AddNewFolder"
import { useFile } from "@/contexts/fileContext"
import { toast } from "sonner"
import { useDashboard } from "@/contexts/DashboardContext"

const quickActions = [
  { label: "Upload Files", icon: Upload, color: "from-blue-500 to-blue-600", description: "Add new files" },
  { label: "New Folder", icon: FolderPlus, color: "from-green-500 to-green-600", description: "Create folder" },
  { label: "Share Files", icon: Users, color: "from-purple-500 to-purple-600", description: "Share with team" },
  { label: "Private Files", icon: Lock, color: "from-orange-500 to-orange-600", description: "Secure your files" },
]

// Helper function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function HomeDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createFolder } = useFile()
  const { storageOverview, isLoading, error, refreshStorageOverview } = useDashboard()
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)

  const navigateToUploadFile = ({ folderId, folderName }: { folderId: string, folderName: string }) => {
    navigate(`/all-files/${folderId}`, {
      state: { folder_id: folderId, folder_name: folderName, access_level: ACCESS_LEVEL.PROTECTED }
    });
  }

  const handleCreateFolder = async (folderName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create folder at root level (no parent_id)
      const result = await createFolder({
        name: folderName.trim(),
        parent_id: undefined
      })
      if (result.success) {
        toast.success("Folder created successfully")
        navigate('/all-files')
      }
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to create folder'
      }
    }
  }

  const handleQuickActionClick = (label: string) => {
    switch (label) {
      case "Upload Files":
        navigateToUploadFile({ folderId: "root", folderName: "root" });
        break;
      case "New Folder":
        setIsCreateFolderModalOpen(true);
        break;
      case "Share Files":
        navigate('/shared-files');
        break;
      case "Private Files":
        navigate('/private-files');
        break;
      default:
        break;
    }
  };

  // Calculate quick stats from real data
  const quickStats = useMemo(() => {
    if (!storageOverview) {
      return [
        { label: "Total Files", value: "0", icon: FileText, change: "", color: "from-blue-500 to-blue-600" },
        { label: "Storage Used", value: "0 GB", icon: Archive, change: "", color: "from-purple-500 to-purple-600" },
        { label: "Shared Today", value: "0", icon: Users, change: "", color: "from-green-500 to-green-600" },
        { label: "Uploads Today", value: "0", icon: Star, change: "", color: "from-yellow-500 to-yellow-600" },
      ];
    }

    return [
      { 
        label: "Total Files", 
        value: storageOverview.storage.totalFiles.toLocaleString(), 
        icon: FileText, 
        change: `${storageOverview.todayActivity.uploads} today`, 
        color: "from-blue-500 to-blue-600" 
      },
      { 
        label: "Storage Used", 
        value: formatBytes(storageOverview.storage.totalSize), 
        icon: Archive, 
        change: `${storageOverview.storageUsedPercentage}% used`, 
        color: "from-purple-500 to-purple-600" 
      },
      { 
        label: "Shared Today", 
        value: storageOverview.todayActivity.shares.toString(), 
        icon: Users, 
        change: `${storageOverview.todayActivity.downloads} downloads`, 
        color: "from-green-500 to-green-600" 
      },
      { 
        label: "Uploads Today", 
        value: storageOverview.todayActivity.uploads.toString(), 
        icon: Upload, 
        change: "This session", 
        color: "from-yellow-500 to-yellow-600" 
      },
    ];
  }, [storageOverview]);

  // Calculate file type breakdown from real data
  const fileTypeBreakdown = useMemo(() => {
    if (!storageOverview) {
      return [
        { type: "Documents", count: 0, size: "0 GB", color: "from-blue-500 to-blue-600", icon: FileText, percentage: 0 },
        { type: "Images", count: 0, size: "0 GB", color: "from-green-500 to-green-600", icon: ImageIcon, percentage: 0 },
        { type: "Videos", count: 0, size: "0 GB", color: "from-purple-500 to-purple-600", icon: Video, percentage: 0 },
        { type: "Audio", count: 0, size: "0 GB", color: "from-orange-500 to-orange-600", icon: Music, percentage: 0 },
        { type: "Other", count: 0, size: "0 GB", color: "from-gray-500 to-gray-600", icon: Archive, percentage: 0 },
      ];
    }

    const totalSize = storageOverview.storage.totalSize || 1; // Avoid division by zero

    return [
      { 
        type: "Documents", 
        count: storageOverview.storage.documentCount, 
        size: formatBytes(storageOverview.storage.documentSize), 
        color: "from-blue-500 to-blue-600", 
        icon: FileText, 
        percentage: Math.round((storageOverview.storage.documentSize / totalSize) * 100) 
      },
      { 
        type: "Images", 
        count: storageOverview.storage.imageCount, 
        size: formatBytes(storageOverview.storage.imageSize), 
        color: "from-green-500 to-green-600", 
        icon: ImageIcon, 
        percentage: Math.round((storageOverview.storage.imageSize / totalSize) * 100) 
      },
      { 
        type: "Videos", 
        count: storageOverview.storage.videoCount, 
        size: formatBytes(storageOverview.storage.videoSize), 
        color: "from-purple-500 to-purple-600", 
        icon: Video, 
        percentage: Math.round((storageOverview.storage.videoSize / totalSize) * 100) 
      },
      { 
        type: "Audio", 
        count: storageOverview.storage.audioCount, 
        size: formatBytes(storageOverview.storage.audioSize), 
        color: "from-orange-500 to-orange-600", 
        icon: Music, 
        percentage: Math.round((storageOverview.storage.audioSize / totalSize) * 100) 
      },
      { 
        type: "Other", 
        count: storageOverview.storage.otherCount || 0, 
        size: formatBytes(storageOverview.storage.otherSize || 0), 
        color: "from-gray-500 to-gray-600", 
        icon: Archive, 
        percentage: Math.round(((storageOverview.storage.otherSize || 0) / totalSize) * 100) 
      },
    ];
  }, [storageOverview]);

  const handleRefresh = async () => {
    toast.promise(refreshStorageOverview(), {
      loading: 'Refreshing data...',
      success: 'Data refreshed!',
      error: 'Failed to refresh data'
    });
  };

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
              Good morning, {user?.display_name} ✨
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">
              Here's what's happening with your files today.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="shrink-0"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </motion.div>
        )}

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
                onClick={() => handleQuickActionClick(action.label)}
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
                <RecentFiles page={1} limit={5} />
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
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {storageOverview ? `${formatBytes(storageOverview.storageUsed)} / ${formatBytes(storageOverview.storageQuota)}` : '0 GB / 0 GB'}
                    </span>
                  </div>
                  <Progress 
                    value={storageOverview ? parseFloat(storageOverview.storageUsedPercentage) : 0} 
                    className="h-2 bg-slate-200 dark:bg-slate-700"
                  >
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
                  </Progress>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {storageOverview ? formatBytes(storageOverview.storageRemaining) : '0 GB'} remaining
                  </p>
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

        {/* Create Folder Modal */}
        {isCreateFolderModalOpen && <AddNewFolder
          onAddFolder={handleCreateFolder}
          variant="button"
          buttonText="New Folder"
          className="shrink-0"
          isOpen={isCreateFolderModalOpen}
          onClose={() => setIsCreateFolderModalOpen(false)}
        />}
      </div>
    </div>
  )
}
