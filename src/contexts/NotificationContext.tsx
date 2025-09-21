import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';

export const NotificationType = {
    FILE_SHARED: 'file_shared',
    FILE_UPDATED: 'file_updated',
    FILE_UPLOAD_COMPLETED: 'file_upload_completed',
    FILE_UPLOAD_FAILED: 'file_upload_failed',
    MULTIPART_UPLOAD_COMPLETED: 'multipart_upload_completed',
    MULTIPART_UPLOAD_FAILED: 'multipart_upload_failed',
    FILE_DELETED: 'file_deleted',
    STORAGE_QUOTA_WARNING: 'storage_quota_warning',
    STORAGE_QUOTA_EXCEEDED: 'storage_quota_exceeded',
    SHARE_EXPIRED: 'share_expired',
    FILE_COMMENTED: 'file_commented',
    PUBLIC_LINK_ACCESSED: 'public_link_accessed',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// Define the attributes interface
export interface NotificationAttributes {
    id?: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    file_id?: string;
    related_user_id?: string;
    is_read: boolean;
    created_at: Date;
    data: Record<string, any>;
}

interface NotificationContextType {
    notifications: NotificationAttributes[];
    addNotification: (notification: NotificationAttributes) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    unreadCount: number;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationAttributes[]>([]);
    const { socket, initializeSocket } = useSocket();

    useEffect(() => {
        initializeSocket();
    }, [initializeSocket]);

    // Set up socket event listeners
    useEffect(() => {
        if (!socket) return;
        const handleNewNotification = (notification: NotificationAttributes) => {
            toast.success(`New notification: ${notification.title}`);
            setNotifications(prev => [notification, ...prev]);
        };

        // Listen for new notifications
        socket.on('notification:new', handleNewNotification);

        // Clean up listeners on unmount or socket change
        return () => {
            socket.off('notification:new', handleNewNotification);
        };
    }, [socket]);

    const addNotification = useCallback((notification: NotificationAttributes) => {
        setNotifications(prev => [notification, ...prev]);
    }, []);

    const markAsRead = useCallback((notificationId: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, is_read: true }
                    : notification
            )
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(notification => ({
                ...notification,
                is_read: true
            }))
        );
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = notifications.filter(notification => !notification.is_read).length;

    const value: NotificationContextType = {
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
        clearNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};