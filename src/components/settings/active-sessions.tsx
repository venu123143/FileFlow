"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/useAuth"
import { Smartphone, Monitor, Tablet, MapPin, Calendar, LogOut, AlertCircle, Loader2, Clock, Info } from "lucide-react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface Session {
    id: string
    refresh_token: string
    created_at: string
    expires_at: string
    last_used_at: string | null
    ip: string | null
    user_agent: string | null
}

export function ActiveSessions() {
    const { getActiveSessions, revokeToken, logoutAll, logoutAllLoading } = useAuth()
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [revokingId, setRevokingId] = useState<string | null>(null)

    const loadSessions = async () => {
        setLoading(true)
        try {
            const data = await getActiveSessions()
            setSessions(data)
        } catch (error) {
            toast.error("Failed to load sessions")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSessions()
    }, [])

    const getDeviceIcon = (userAgent: string | null) => {
        if (!userAgent) return <Monitor className="h-5 w-5" />

        const ua = userAgent.toLowerCase()
        if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
            return <Smartphone className="h-5 w-5" />
        }
        if (ua.includes("tablet") || ua.includes("ipad")) {
            return <Tablet className="h-5 w-5" />
        }
        return <Monitor className="h-5 w-5" />
    }

    const getBrowserName = (userAgent: string | null) => {
        if (!userAgent) return "Unknown Browser"

        const ua = userAgent.toLowerCase()
        if (ua.includes("chrome")) return "Chrome"
        if (ua.includes("firefox")) return "Firefox"
        if (ua.includes("safari")) return "Safari"
        if (ua.includes("edge")) return "Edge"
        if (ua.includes("opera")) return "Opera"
        return "Unknown Browser"
    }

    const getDeviceType = (userAgent: string | null) => {
        if (!userAgent) return "Unknown Device"

        const ua = userAgent.toLowerCase()
        if (ua.includes("windows")) return "Windows"
        if (ua.includes("mac")) return "macOS"
        if (ua.includes("linux")) return "Linux"
        if (ua.includes("android")) return "Android"
        if (ua.includes("iphone") || ua.includes("ipad")) return "iOS"
        return "Unknown Device"
    }

    const handleRevokeSession = async (sessionId: string, refreshToken: string) => {
        setRevokingId(sessionId)
        try {
            await revokeToken(refreshToken)
            await loadSessions()
            toast.success("Session revoked successfully")
        } catch (error) {
            // Error is already handled in revokeToken
        } finally {
            setRevokingId(null)
        }
    }

    const handleLogoutAll = async () => {
        await logoutAll()
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
    }

    const isSessionExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date()
    }

    const getDaysUntilExpiry = (expiresAt: string) => {
        const now = new Date()
        const expiry = new Date(expiresAt)
        const diffTime = expiry.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <Card>
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Monitor className="h-5 w-5" />
                                Active Sessions
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Manage your active sessions across all devices
                            </CardDescription>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={logoutAllLoading || sessions.length === 0}
                                    className="shrink-0 w-full sm:w-auto"
                                >
                                    {logoutAllLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Logging out...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout All Devices
                                        </>
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Logout from all devices?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will revoke all active sessions and log you out from all devices. You'll need to log in again.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleLogoutAll}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Logout All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-4 sm:p-6 pt-2 sm:pt-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 sm:py-16">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Loading sessions...</p>
                            </div>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                            <div className="p-3 rounded-full bg-muted mb-4">
                                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-medium mb-1">No active sessions</h3>
                            <p className="text-sm text-muted-foreground">You don't have any active sessions at the moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map((session, index) => {
                                const expired = isSessionExpired(session.expires_at)
                                const daysUntilExpiry = getDaysUntilExpiry(session.expires_at)

                                return (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card
                                            className={cn(
                                                "transition-all hover:shadow-md",
                                                expired && "opacity-50 border-dashed"
                                            )}
                                        >
                                            <CardContent className="p-4 sm:p-5">
                                                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                                    <div className={cn(
                                                        "p-3 rounded-lg shrink-0 flex items-center justify-center",
                                                        expired ? "bg-muted" : "bg-primary/10",
                                                        // On mobile, maybe we want the icon to be separate or just top-left?
                                                        // Keeping it left is standard, but let's ensure it doesn't squash content.
                                                        // Actually, sticking with row is usually better for lists, but let's make it robust.
                                                    )}>
                                                        <div className={cn(
                                                            expired ? "text-muted-foreground" : "text-primary"
                                                        )}>
                                                            {getDeviceIcon(session.user_agent)}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 min-w-0 space-y-3 w-full">
                                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                    <h4 className="font-semibold text-base">
                                                                        {getBrowserName(session.user_agent)} <span className="text-muted-foreground font-normal">on</span> {getDeviceType(session.user_agent)}
                                                                    </h4>
                                                                    {expired ? (
                                                                        <Badge variant="destructive" className="text-xs">
                                                                            Expired
                                                                        </Badge>
                                                                    ) : daysUntilExpiry <= 7 ? (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            Expires soon
                                                                        </Badge>
                                                                    ) : null}
                                                                </div>
                                                                {session.user_agent && (
                                                                    <p className="text-xs text-muted-foreground break-all sm:truncate mt-1">
                                                                        {session.user_agent}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {!expired && (
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            disabled={revokingId === session.id}
                                                                            className="shrink-0 w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 sm:border-transparent"
                                                                        >
                                                                            {revokingId === session.id ? (
                                                                                <>
                                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                    Revoking...
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <LogOut className="mr-2 h-4 w-4" />
                                                                                    Revoke
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This will log out this device. You'll need to log in again on this device.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleRevokeSession(session.id, session.refresh_token)}
                                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                            >
                                                                                Revoke Session
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            )}
                                                        </div>

                                                        <Separator />

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                            {session.ip && (
                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                    <MapPin className="h-4 w-4 shrink-0" />
                                                                    <span className="truncate">{session.ip}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Calendar className="h-4 w-4 shrink-0" />
                                                                <span className="truncate">
                                                                    <span className="font-medium">Created:</span> {formatDate(session.created_at)}
                                                                </span>
                                                            </div>
                                                            {session.last_used_at && (
                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                    <Clock className="h-4 w-4 shrink-0" />
                                                                    <span className="truncate">
                                                                        <span className="font-medium">Last used:</span> {formatDate(session.last_used_at)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Calendar className="h-4 w-4 shrink-0" />
                                                                <span className="truncate">
                                                                    <span className="font-medium">Expires:</span> {formatDate(session.expires_at)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-muted">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        About Sessions
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-2.5 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Each session represents a logged-in device</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Sessions automatically expire after 30 days</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>You can revoke individual sessions or logout from all devices</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Revoking a session will require re-authentication on that device</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
