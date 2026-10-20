"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/useAuth"
import { formatRelativeTime } from "@/lib/utils"
import { Smartphone, Monitor, Tablet, Loader2 } from "lucide-react"
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

interface Session {
    id: string
    created_at: string
    expires_at: string
    last_used_at: string | null
    ip: string | null
    user_agent: string | null
    is_current: boolean
}

// Order matters: Edge/Opera/Chrome UAs also contain "Safari", Edge also contains "Chrome"
const getBrowser = (ua: string) => {
    if (/edg\//i.test(ua)) return "Edge"
    if (/opr\/|opera/i.test(ua)) return "Opera"
    if (/firefox/i.test(ua)) return "Firefox"
    if (/chrome|crios/i.test(ua)) return "Chrome"
    if (/safari/i.test(ua)) return "Safari"
    return "Browser"
}

// Order matters: Android UAs contain "Linux", iOS UAs contain "Mac OS X"
const getOS = (ua: string) => {
    if (/android/i.test(ua)) return "Android"
    if (/iphone|ipad|ipod/i.test(ua)) return "iOS"
    if (/windows/i.test(ua)) return "Windows"
    if (/mac os|macintosh/i.test(ua)) return "macOS"
    if (/linux|x11/i.test(ua)) return "Linux"
    return null
}

const getDeviceIcon = (ua: string) => {
    if (/ipad|tablet/i.test(ua)) return Tablet
    if (/mobile|android|iphone/i.test(ua)) return Smartphone
    return Monitor
}

export function ActiveSessions() {
    const { getActiveSessions, revokeSession, logoutAll, logoutAllLoading } = useAuth()
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [revokingId, setRevokingId] = useState<string | null>(null)

    const loadSessions = useCallback(async () => {
        try {
            const data: Session[] = await getActiveSessions()
            // Current device first, then most recently active
            const lastActive = (s: Session) => new Date(s.last_used_at ?? s.created_at).getTime()
            setSessions([...data].sort((a, b) => Number(b.is_current) - Number(a.is_current) || lastActive(b) - lastActive(a)))
        } catch {
            toast.error("Couldn't load your sessions. Try refreshing the page.")
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        loadSessions()
    }, [loadSessions])

    const handleRevoke = async (sessionId: string) => {
        setRevokingId(sessionId)
        const result = await revokeSession(sessionId)
        if (result.success) {
            setSessions((prev) => prev.filter((s) => s.id !== sessionId))
            toast.success("Device logged out")
        }
        setRevokingId(null)
    }

    const otherSessions = sessions.filter((s) => !s.is_current).length

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                    <CardTitle>Active sessions</CardTitle>
                    <CardDescription>Devices where you're logged in. Log out any you don't recognize.</CardDescription>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={logoutAllLoading || sessions.length === 0}>
                            {logoutAllLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Log out everywhere
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Log out everywhere?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This logs you out on every device, including this one. You'll need to log in again.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => logoutAll()}>Log out everywhere</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>

            <CardContent className="p-0">
                {loading ? (
                    <div className="divide-y border-t">
                        {[0, 1].map((i) => (
                            <div key={i} className="flex items-center gap-4 px-6 py-4">
                                <Skeleton className="h-9 w-9 rounded-md" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-56" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sessions.length === 0 ? (
                    <p className="border-t px-6 py-10 text-center text-sm text-muted-foreground">
                        No active sessions found.
                    </p>
                ) : (
                    <ul className="divide-y border-t">
                        {sessions.map((session) => {
                            const ua = session.user_agent ?? ""
                            const Icon = getDeviceIcon(ua)
                            const os = getOS(ua)
                            const title = ua ? `${getBrowser(ua)}${os ? ` on ${os}` : ""}` : "Unknown device"
                            const lastActive = formatRelativeTime(session.last_used_at ?? session.created_at)

                            return (
                                <li key={session.id} className="flex items-center gap-4 px-6 py-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-medium">{title}</p>
                                            {session.is_current && <Badge variant="secondary">This device</Badge>}
                                        </div>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {session.is_current ? "Active now" : `Last active ${lastActive}`}
                                            {session.ip ? ` from ${session.ip}` : ""}
                                        </p>
                                    </div>

                                    {!session.is_current && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm" disabled={revokingId === session.id}>
                                                    {revokingId === session.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Log out
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Log out {title}?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        That device will be logged out within 15 minutes and will need to log in again.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleRevoke(session.id)}>Log out device</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}
                {!loading && otherSessions === 0 && sessions.length > 0 && (
                    <p className="border-t px-6 py-3 text-xs text-muted-foreground">You're only logged in on this device.</p>
                )}
            </CardContent>
        </Card>
    )
}
