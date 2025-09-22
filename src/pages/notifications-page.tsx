"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Bell,
    CheckCircle,
    Search,
    Paperclip,
    FileText,
    Upload,
    Trash2,
    Share2,
    AlertTriangle,
    XCircle,
    MessageSquare,
    ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useNotifications, NotificationType } from "@/contexts/NotificationContext"

// Helper function to get notification icon based on type
const getNotificationIcon = (type: string) => {
    switch (type) {
        case NotificationType.FILE_SHARED:
            return <Share2 className="h-4 w-4" />
        case NotificationType.FILE_UPLOAD_COMPLETED:
        case NotificationType.MULTIPART_UPLOAD_COMPLETED:
            return <Upload className="h-4 w-4" />
        case NotificationType.FILE_UPLOAD_FAILED:
        case NotificationType.MULTIPART_UPLOAD_FAILED:
            return <XCircle className="h-4 w-4" />
        case NotificationType.FILE_DELETED:
            return <Trash2 className="h-4 w-4" />
        case NotificationType.FILE_COMMENTED:
            return <MessageSquare className="h-4 w-4" />
        case NotificationType.STORAGE_QUOTA_WARNING:
        case NotificationType.STORAGE_QUOTA_EXCEEDED:
            return <AlertTriangle className="h-4 w-4" />
        case NotificationType.SHARE_EXPIRED:
            return <ExternalLink className="h-4 w-4" />
        case NotificationType.PUBLIC_LINK_ACCESSED:
            return <ExternalLink className="h-4 w-4" />
        default:
            return <FileText className="h-4 w-4" />
    }
}

// Helper function to get notification type color
const getNotificationTypeColor = (type: string) => {
    switch (type) {
        case NotificationType.FILE_UPLOAD_COMPLETED:
        case NotificationType.MULTIPART_UPLOAD_COMPLETED:
            return "text-green-600 bg-green-100"
        case NotificationType.FILE_UPLOAD_FAILED:
        case NotificationType.MULTIPART_UPLOAD_FAILED:
            return "text-red-600 bg-red-100"
        case NotificationType.STORAGE_QUOTA_WARNING:
            return "text-yellow-600 bg-yellow-100"
        case NotificationType.STORAGE_QUOTA_EXCEEDED:
            return "text-red-600 bg-red-100"
        case NotificationType.FILE_SHARED:
        case NotificationType.FILE_COMMENTED:
            return "text-blue-600 bg-blue-100"
        case NotificationType.FILE_DELETED:
            return "text-gray-600 bg-gray-100"
        default:
            return "text-gray-600 bg-gray-100"
    }
}

// Helper function to format timestamp
const formatTimestamp = (dateString: string | Date) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    
    return date.toLocaleDateString()
}

export default function NotificationsPage() {
    const [activeFilter, setActiveFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const observerRef = useRef<HTMLDivElement>(null)
    
    const { 
        notifications, 
        unreadCount, 
        loading,
        loadingMore,
        hasMore,
        totalCount,
        loadMoreNotifications,
        markAsRead, 
        markAllAsRead 
    } = useNotifications()

    // Infinite scroll observer
    const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
        const [target] = entries
        if (target.isIntersecting && hasMore && !loadingMore) {
            loadMoreNotifications()
        }
    }, [hasMore, loadingMore, loadMoreNotifications])

    useEffect(() => {
        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.1,
            rootMargin: '100px',
        })

        if (observerRef.current) {
            observer.observe(observerRef.current)
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current)
            }
        }
    }, [observerCallback])

    const filteredNotifications = useMemo(() => {
        let filtered = notifications

        // Filter by category
        if (activeFilter === "file") {
            filtered = filtered.filter(n => [
                NotificationType.FILE_SHARED,
                NotificationType.FILE_UPDATED,
                NotificationType.FILE_UPLOAD_COMPLETED,
                NotificationType.FILE_UPLOAD_FAILED,
                NotificationType.MULTIPART_UPLOAD_COMPLETED,
                NotificationType.MULTIPART_UPLOAD_FAILED,
                NotificationType.FILE_DELETED,
                NotificationType.FILE_COMMENTED
            ].includes(n.type as any))
        } else if (activeFilter === "storage") {
            filtered = filtered.filter(n => [
                NotificationType.STORAGE_QUOTA_WARNING,
                NotificationType.STORAGE_QUOTA_EXCEEDED
            ].includes(n.type as any))
        } else if (activeFilter === "sharing") {
            filtered = filtered.filter(n => [
                NotificationType.FILE_SHARED,
                NotificationType.SHARE_EXPIRED,
                NotificationType.PUBLIC_LINK_ACCESSED
            ].includes(n.type as any))
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.message.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filtered
    }, [notifications, activeFilter, searchQuery])

    // Memoize notification categories for better performance
    const notificationCategories = useMemo(() => [
        { id: "all", label: "All", count: notifications.length },
        { id: "file", label: "Files", count: notifications.filter(n => {
            const fileTypes = [
                NotificationType.FILE_SHARED,
                NotificationType.FILE_UPDATED,
                NotificationType.FILE_UPLOAD_COMPLETED,
                NotificationType.FILE_UPLOAD_FAILED,
                NotificationType.MULTIPART_UPLOAD_COMPLETED,
                NotificationType.MULTIPART_UPLOAD_FAILED,
                NotificationType.FILE_DELETED,
                NotificationType.FILE_COMMENTED
            ];
            return fileTypes.includes(n.type as any);
        }).length },
        { id: "storage", label: "Storage", count: notifications.filter(n => {
            const storageTypes = [
                NotificationType.STORAGE_QUOTA_WARNING,
                NotificationType.STORAGE_QUOTA_EXCEEDED
            ];
            return storageTypes.includes(n.type as any);
        }).length },
        { id: "sharing", label: "Sharing", count: notifications.filter(n => {
            const sharingTypes = [
                NotificationType.FILE_SHARED,
                NotificationType.SHARE_EXPIRED,
                NotificationType.PUBLIC_LINK_ACCESSED
            ];
            return sharingTypes.includes(n.type as any);
        }).length }
    ], [notifications])

    const handleMarkAsRead = async (notificationId: string) => {
        await markAsRead(notificationId)
    }

    const handleMarkAllAsRead = async () => {
        await markAllAsRead()
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Bell className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                            <p className="text-muted-foreground">
                                {unreadCount} unread • {totalCount} total
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0 || loading}
                        className="gap-2"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Mark All Read
                    </Button>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-6"
                >
                    <div className="flex items-center gap-6 border-b border-gray-200">
                        {notificationCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveFilter(category.id)}
                                className={`
                  flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors relative
                  ${activeFilter === category.id
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                    }
                `}
                            >
                                {category.label}
                                {category.count > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs bg-gray-200 text-gray-700"
                                    >
                                        {category.count}
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search notifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10"
                        />
                    </div>
                </motion.div>

                {/* Notifications List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="space-y-3"
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <AnimatePresence mode="popLayout">
                            {filteredNotifications.map((notification, index) => (
                                <motion.div
                                    key={notification.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`
                                        bg-white border border-gray-200 rounded-lg p-4 transition-colors cursor-pointer
                                        ${!notification.is_read ? 'border-l-4 border-l-blue-500' : 'hover:border-gray-300'}
                                    `}
                                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Notification Icon */}
                                        <div className="flex-shrink-0 relative">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getNotificationTypeColor(notification.type)}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            {!notification.is_read && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    {/* Title and Type */}
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <Badge
                                                            variant="secondary"
                                                            className={`text-xs ${getNotificationTypeColor(notification.type)}`}
                                                        >
                                                            {notification.type.replace(/_/g, ' ').toLowerCase()}
                                                        </Badge>
                                                    </div>

                                                    {/* Message */}
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {notification.message}
                                                    </p>

                                                    {/* File Info */}
                                                    {notification.file_id && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                            <Paperclip className="h-3 w-3" />
                                                            <span className="font-medium">File ID: {notification.file_id}</span>
                                                        </div>
                                                    )}

                                                    {/* Additional Data */}
                                                    {notification.data && Object.keys(notification.data).length > 0 && (
                                                        <div className="text-xs text-gray-500 mb-2">
                                                            {notification.data.fileName && (
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-3 w-3" />
                                                                    <span>{notification.data.fileName}</span>
                                                                    {notification.data.fileSize && (
                                                                        <span>• {notification.data.fileSize}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Timestamp */}
                                                <div className="flex-shrink-0">
                                                    <span className="text-xs text-gray-400">
                                                        {formatTimestamp(notification.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Infinite Scroll Loading Indicator */}
                        {loadingMore && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center py-8"
                            >
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                                <span className="ml-2 text-sm text-muted-foreground">Loading more notifications...</span>
                            </motion.div>
                        )}

                        {/* Infinite Scroll Observer */}
                        {hasMore && !loadingMore && (
                            <div ref={observerRef} className="h-4" />
                        )}

                        {/* Empty State */}
                        {filteredNotifications.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                                <p className="text-gray-500">
                                    {searchQuery
                                        ? "Try adjusting your search terms"
                                        : "You're all caught up! No new notifications."
                                    }
                                </p>
                            </motion.div>
                        )}
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    )
}