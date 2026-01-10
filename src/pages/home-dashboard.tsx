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
  Users,
  Upload,
  FolderPlus,
  Activity,
  Lock,
  RefreshCw,
  HardDrive,
  FolderOpen,
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
        { label: "Uploads Today", value: "0", icon: Upload, change: "", color: "from-yellow-500 to-yellow-600" },
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
        icon: HardDrive, 
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
        label: "Total Folders", 
        value: storageOverview.storage.totalFolders.toString(), 
        icon: FolderOpen, 
        change: "Organized", 
        color: "from-yellow-500 to-yellow-600" 
      },
    ];
  }, [storageOverview]);

  // Calculate file type breakdown from real data
  const fileTypeBreakdown = useMemo(() => {
    if (!storageOverview) {
      return [
        { type: "Documents", count: 0, size: "0 Bytes", color: "bg-blue-500", icon: FileText, percentage: 0 },
        { type: "Images", count: 0, size: "0 Bytes", color: "bg-green-500", icon: ImageIcon, percentage: 0 },
        { type: "Videos", count: 0, size: "0 Bytes", color: "bg-purple-500", icon: Video, percentage: 0 },
        { type: "Audio", count: 0, size: "0 Bytes", color: "bg-orange-500", icon: Music, percentage: 0 },
        { type: "Other", count: 0, size: "0 Bytes", color: "bg-gray-500", icon: Archive, percentage: 0 },
      ];
    }

    const totalSize = storageOverview.storage.totalSize || 1;

    return [
      { 
        type: "Images", 
        count: storageOverview.storage.imageCount, 
        size: formatBytes(storageOverview.storage.imageSize), 
        color: "bg-green-500", 
        icon: ImageIcon, 
        percentage: Math.round((storageOverview.storage.imageSize / totalSize) * 100) 
      },
      { 
        type: "Documents", 
        count: storageOverview.storage.documentCount, 
        size: formatBytes(storageOverview.storage.documentSize), 
        color: "bg-blue-500", 
        icon: FileText, 
        percentage: Math.round((storageOverview.storage.documentSize / totalSize) * 100) 
      },
      { 
        type: "Videos", 
        count: storageOverview.storage.videoCount, 
        size: formatBytes(storageOverview.storage.videoSize), 
        color: "bg-purple-500", 
        icon: Video, 
        percentage: Math.round((storageOverview.storage.videoSize / totalSize) * 100) 
      },
      { 
        type: "Audio", 
        count: storageOverview.storage.audioCount, 
        size: formatBytes(storageOverview.storage.audioSize), 
        color: "bg-orange-500", 
        icon: Music, 
        percentage: Math.round((storageOverview.storage.audioSize / totalSize) * 100) 
      },
      { 
        type: "Other", 
        count: storageOverview.storage.otherCount || 0, 
        size: formatBytes(storageOverview.storage.otherSize || 0), 
        color: "bg-gray-500", 
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Welcome back, {user?.display_name}! 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">
              Here's your file overview
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="shrink-0 border-slate-200 dark:border-slate-700"
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
            className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4"
          >
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }} 
                onClick={() => handleQuickActionClick(action.label)}
              >
                <Card className="group cursor-pointer border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 bg-white dark:bg-slate-900 hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-lg bg-gradient-to-br shrink-0",
                        action.color
                      )}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {action.label}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
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
            >
              <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={cn(
                      "p-2.5 rounded-lg bg-gradient-to-br shrink-0",
                      stat.color
                    )}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Files */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Recent Files
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
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
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Activity className="h-5 w-5 text-purple-500" />
                  Storage Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Total Storage Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Storage Used</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {storageOverview ? `${formatBytes(storageOverview.storageUsed)} / ${formatBytes(storageOverview.storageQuota)}` : '0 / 0'}
                    </span>
                  </div>
                  <Progress 
                    value={storageOverview ? parseFloat(storageOverview.storageUsedPercentage) : 0} 
                    className="h-2.5"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {storageOverview ? formatBytes(storageOverview.storageRemaining) : '0 GB'} remaining
                  </p>
                </div>

                {/* File Type Breakdown */}
                <div className="space-y-4 pt-2">
                  {fileTypeBreakdown.map((item, index) => (
                    <motion.div
                      key={item.type}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-2 h-2 rounded-full", item.color)} />
                          <item.icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
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
