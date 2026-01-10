import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  Download,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  TrendingUp,
  Upload,
  Share2,
  Activity,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/contexts/DashboardContext";
import { toast } from "sonner";

// Helper function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export function Analytics() {
  const { 
    storageOverview, 
    analyticsSummary, 
    isLoading, 
    error, 
    refreshStorageOverview,
    refreshAnalyticsSummary 
  } = useDashboard();
  
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshStorageOverview(),
        refreshAnalyticsSummary()
      ]);
      toast.success("Analytics data refreshed!");
    } catch (err) {
      toast.error("Failed to refresh analytics");
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Analytics Dashboard 📊
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">
              Track your storage usage and file activity
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={refreshing}
            className="shrink-0"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
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

        {/* Activity Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Uploads Today
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {storageOverview?.todayActivity.uploads || 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total: {storageOverview?.storage.totalFiles || 0} files
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Downloads Today
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {storageOverview?.todayActivity.downloads || 0}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Active
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                  <Download className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Shares Today
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {storageOverview?.todayActivity.shares || 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Collaborative
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Public Links
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {storageOverview?.todayActivity.publicLinks || 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Created today
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Storage Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Storage Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Storage Breakdown by File Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Documents */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Documents</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatBytes(storageOverview?.storage.documentSize || 0)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {storageOverview?.storage.documentCount || 0} files
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={storageOverview ? (storageOverview.storage.documentSize / storageOverview.storage.totalSize) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Images</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatBytes(storageOverview?.storage.imageSize || 0)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {storageOverview?.storage.imageCount || 0} files
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={storageOverview ? (storageOverview.storage.imageSize / storageOverview.storage.totalSize) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                {/* Videos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-purple-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Videos</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatBytes(storageOverview?.storage.videoSize || 0)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {storageOverview?.storage.videoCount || 0} files
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={storageOverview ? (storageOverview.storage.videoSize / storageOverview.storage.totalSize) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                {/* Audio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Music className="h-5 w-5 text-orange-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Audio</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatBytes(storageOverview?.storage.audioSize || 0)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {storageOverview?.storage.audioCount || 0} files
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={storageOverview ? (storageOverview.storage.audioSize / storageOverview.storage.totalSize) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                {/* Other */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Archive className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Other</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatBytes(storageOverview?.storage.otherSize || 0)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {storageOverview?.storage.otherCount || 0} files
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={storageOverview ? ((storageOverview.storage.otherSize || 0) / storageOverview.storage.totalSize) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Storage */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Archive className="h-5 w-5 text-purple-500" />
                  Total Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-slate-200 dark:text-slate-700"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - (parseFloat(storageOverview?.storageUsedPercentage || "0") / 100))}`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {storageOverview?.storageUsedPercentage || "0"}%
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Used</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Total Space</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatBytes(storageOverview?.storageQuota || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Used</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {formatBytes(storageOverview?.storageUsed || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Available</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatBytes(storageOverview?.storageRemaining || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Last updated: Just now</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 30-Day Summary */}
        {analyticsSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  30-Day Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {analyticsSummary.totalUploads || 0}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Uploads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {analyticsSummary.totalDownloads || 0}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Downloads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {analyticsSummary.totalShares || 0}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Shares</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Analytics;

