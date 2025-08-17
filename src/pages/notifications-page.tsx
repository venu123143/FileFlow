"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Bell,
    CheckCircle,
    Search,
    Play,
    Paperclip
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Notification {
    id: string
    type: "success" | "warning" | "info" | "error"
    title: string
    message: string
    timestamp: string
    read: boolean
    category: "file" | "security" | "storage" | "system" | "sharing" | "finance" | "management" | "marketing" | "hr" | "design"
    action?: {
        label: string
        onClick: () => void
        variant?: "default" | "outline"
    }
    metadata?: {
        fileName?: string
        fileSize?: string
        user?: string
        avatar?: string
        project?: string
        isOnline?: boolean
    }
    hasComment?: boolean
    commentText?: string
    isMention?: boolean
}

const mockNotifications: Notification[] = [
    {
        id: "1",
        type: "success",
        title: "Monica shared a new document in Q3 Financials",
        message: "A new financial document has been shared for review",
        timestamp: "Now",
        read: false,
        category: "finance",
        action: {
            label: "Approve",
            onClick: () => console.log("Approve document"),
            variant: "default"
        },
        metadata: {
            user: "Monica",
            avatar: "M",
            project: "Q3 Financials",
            isOnline: true
        }
    },
    {
        id: "2",
        type: "info",
        title: "David commented in Performance Reviews",
        message: "Please ensure the feedback is constructive and actionable. We need to finalize this by tomorrow.",
        timestamp: "2h ago",
        read: false,
        category: "management",
        hasComment: true,
        commentText: "Please ensure the feedback is constructive and actionable. We need to finalize this by tomorrow.",
        metadata: {
            user: "David",
            avatar: "D",
            project: "Performance Reviews",
            isOnline: true
        }
    },
    {
        id: "3",
        type: "info",
        title: "Leo added a new file in Marketing Campaigns",
        message: "Q3_Campaigns_Strategy.csv has been uploaded",
        timestamp: "2h ago",
        read: false,
        category: "marketing",
        metadata: {
            user: "Leo",
            avatar: "L",
            project: "Marketing Campaigns",
            fileName: "Q3_Campaigns_Strategy.csv",
            fileSize: "12MB"
        }
    },
    {
        id: "4",
        type: "info",
        title: "Nina mentioned you in a comment on Annual Report",
        message: "Could you please verify the numbers on page 4?",
        timestamp: "2h ago",
        read: false,
        category: "finance",
        isMention: true,
        hasComment: true,
        commentText: "Could you please verify the numbers on page 4?",
        action: {
            label: "Reply",
            onClick: () => console.log("Reply to comment"),
            variant: "default"
        },
        metadata: {
            user: "Nina",
            avatar: "N",
            project: "Annual Report"
        }
    },
    {
        id: "5",
        type: "success",
        title: "Ethan marked 3 tasks complete in Website Redesign",
        message: "Multiple tasks have been completed in the website redesign project",
        timestamp: "2h ago",
        read: true,
        category: "design",
        metadata: {
            user: "Ethan",
            avatar: "E",
            project: "Website Redesign"
        }
    },
    {
        id: "6",
        type: "info",
        title: "Noah uploaded a new video tutorial in Training Materials",
        message: "Leadership_training_tutorial.mp4 has been uploaded",
        timestamp: "1 day ago",
        read: true,
        category: "hr",
        metadata: {
            user: "Noah",
            avatar: "N",
            project: "Training Materials",
            fileName: "Leadership_training_tutorial.mp4",
            fileSize: "45MB"
        }
    },
    {
        id: "7",
        type: "warning",
        title: "Storage Space Running Low",
        message: "You're using 85% of your available storage. Consider cleaning up old files.",
        timestamp: "1 hour ago",
        read: false,
        category: "storage",
        action: {
            label: "Manage Storage",
            onClick: () => console.log("Manage storage"),
            variant: "default"
        },
        metadata: {
            fileSize: "85 GB / 100 GB"
        }
    },
    {
        id: "8",
        type: "success",
        title: "Security Scan Complete",
        message: "Your files have been scanned for malware. All files are safe.",
        timestamp: "5 hours ago",
        read: true,
        category: "security",
        metadata: {
            fileName: "Security Scan"
        }
    }
]

const notificationCategories = [
    { id: "all", label: "All", count: mockNotifications.length },
    { id: "teams", label: "Teams", count: mockNotifications.filter(n => ["finance", "management", "marketing", "hr", "design"].includes(n.category)).length },
    { id: "mentions", label: "Mentions", count: mockNotifications.filter(n => n.isMention).length }
]

export default function NotificationsPage() {
    const [activeFilter, setActiveFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredNotifications = useMemo(() => {
        let filtered = mockNotifications

        // Filter by category
        if (activeFilter === "teams") {
            filtered = filtered.filter(n => ["finance", "management", "marketing", "hr", "design"].includes(n.category))
        } else if (activeFilter === "mentions") {
            filtered = filtered.filter(n => n.isMention)
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.metadata?.user?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filtered
    }, [activeFilter, searchQuery])

    const unreadCount = mockNotifications.filter(n => !n.read).length

    const getCategoryColor = (): string => {
        return "bg-blue-100 text-blue-700"
    }

    const getCategoryLabel = (category: Notification["category"]) => {
        switch (category) {
            case "finance":
                return "Finance"
            case "management":
                return "Management"
            case "marketing":
                return "Marketing"
            case "hr":
                return "HR"
            case "design":
                return "Design"
            case "storage":
                return "Storage"
            case "security":
                return "Security"
            default:
                return category
        }
    }

    const markAllAsRead = () => {
        console.log("Mark all as read")
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
                                {unreadCount} unread • {mockNotifications.length} total
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
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
                  bg-white border border-gray-200 rounded-lg p-4 transition-colors
                  ${!notification.read ? 'border-l-4 border-l-blue-500' : 'hover:border-gray-300'}
                `}
                            >
                                <div className="flex items-start gap-4">
                                    {/* User Avatar */}
                                    <div className="flex-shrink-0 relative">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">
                                                {notification.metadata?.user ? notification.metadata.user[0] : 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {notification.metadata?.isOnline && (
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                {/* Title and Category */}
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-xs ${getCategoryColor()}`}
                                                    >
                                                        {getCategoryLabel(notification.category)}
                                                    </Badge>
                                                </div>

                                                {/* Comment Text */}
                                                {notification.hasComment && notification.commentText && (
                                                    <p className="text-sm text-gray-600 mb-2 pl-4 border-l-2 border-gray-200">
                                                        {notification.commentText}
                                                    </p>
                                                )}

                                                {/* File/Project Info */}
                                                {notification.metadata?.fileName && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                        <Paperclip className="h-3 w-3" />
                                                        <span className="font-medium">{notification.metadata.fileName}</span>
                                                        {notification.metadata.fileSize && (
                                                            <span className="text-gray-400">• {notification.metadata.fileSize}</span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Video File */}
                                                {notification.metadata?.fileName?.includes('.mp4') && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                        <Play className="h-3 w-3" />
                                                        <span className="font-medium">{notification.metadata.fileName}</span>
                                                        {notification.metadata.fileSize && (
                                                            <span className="text-gray-400">• {notification.metadata.fileSize}</span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Action Button */}
                                                {notification.action && (
                                                    <div className="mt-3">
                                                        <Button
                                                            variant={notification.action.variant || "default"}
                                                            size="sm"
                                                            onClick={notification.action.onClick}
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            {notification.action.label}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Timestamp */}
                                            <div className="flex-shrink-0">
                                                <span className="text-xs text-gray-400">
                                                    {notification.timestamp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

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
                </motion.div>
            </div>
        </div>
    )
}