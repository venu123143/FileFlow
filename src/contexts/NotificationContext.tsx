import React, {
    createContext,
    useContext,
    useReducer,
    useEffect,
    type ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import notificationApi from "@/api/notification.api";

// 🔹 Notification Types
export const NotificationType = {
    FILE_SHARED: "file_shared",
    FILE_UPDATED: "file_updated",
    FILE_UPLOAD_COMPLETED: "file_upload_completed",
    FILE_UPLOAD_FAILED: "file_upload_failed",
    MULTIPART_UPLOAD_COMPLETED: "multipart_upload_completed",
    MULTIPART_UPLOAD_FAILED: "multipart_upload_failed",
    FILE_DELETED: "file_deleted",
    STORAGE_QUOTA_WARNING: "storage_quota_warning",
    STORAGE_QUOTA_EXCEEDED: "storage_quota_exceeded",
    SHARE_EXPIRED: "share_expired",
    FILE_COMMENTED: "file_commented",
    PUBLIC_LINK_ACCESSED: "public_link_accessed",
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface NotificationAttributes {
    id: string;
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

// 🔹 State
interface NotificationState {
    notifications: NotificationAttributes[];
    loading: boolean;
    unreadCount: number;
}

// 🔹 Actions
type NotificationAction =
    | { type: "SET_NOTIFICATIONS"; payload: NotificationAttributes[] }
    | { type: "ADD_NOTIFICATION"; payload: NotificationAttributes }
    | { type: "MARK_AS_READ"; id: string }
    | { type: "MARK_ALL_AS_READ" }
    | { type: "CLEAR_NOTIFICATIONS" }
    | { type: "SET_LOADING"; payload: boolean };

// 🔹 Reducer
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
    switch (action.type) {
        case "SET_NOTIFICATIONS":
            return {
                ...state,
                notifications: action.payload,
                unreadCount: action.payload.filter((n) => !n.is_read).length,
            };
        case "ADD_NOTIFICATION":
            return {
                ...state,
                notifications: [action.payload, ...state.notifications],
                unreadCount: state.unreadCount + (action.payload.is_read ? 0 : 1),
            };
        case "MARK_AS_READ":
            return {
                ...state,
                notifications: state.notifications.map((n) =>
                    n.id === action.id ? { ...n, is_read: true } : n
                ),
                unreadCount: state.unreadCount - 1,
            };
        case "MARK_ALL_AS_READ":
            return {
                ...state,
                notifications: state.notifications.map((n) => ({
                    ...n,
                    is_read: true,
                })),
                unreadCount: 0,
            };
        case "CLEAR_NOTIFICATIONS":
            return { ...state, notifications: [], unreadCount: 0 };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        default:
            return state;
    }
}

// 🔹 Context Type
interface NotificationContextType extends NotificationState {
    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearNotifications: () => void;
}

// 🔹 Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children}) => {
    const [state, dispatch] = useReducer(notificationReducer, {
        notifications: [],
        loading: false,
        unreadCount: 0,
    });

    const queryClient = useQueryClient();
    const { socket, initializeSocket } = useSocket();

    // Initialize socket
    useEffect(() => {
        initializeSocket();
    }, [initializeSocket]);

    // 🔹 Socket listener
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: NotificationAttributes) => {
            toast.success(`🔔 ${notification.title}`);
            dispatch({ type: "ADD_NOTIFICATION", payload: notification });
        };

        socket.on("notification:new", handleNewNotification);

        return () => {
            socket.off("notification:new", handleNewNotification);
        };
    }, [socket]);

    // 🔹 Queries
    const { refetch: fetchNotifications } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const result = await notificationApi.getUserNotifications();
            dispatch({ type: "SET_NOTIFICATIONS", payload: result });
            return result;
        },
        enabled: false, // manual fetch
    });

    const { refetch: fetchUnreadCount } = useQuery({
        queryKey: ["notificationsUnreadCount"],
        queryFn: async () => {
            const result = await notificationApi.getUnreadNotificationsCount();
            dispatch({ type: "SET_LOADING", payload: false });
            return result;
        },
        enabled: false,
    });

    // 🔹 Mutations
    const { mutateAsync: markAsReadMutation } = useMutation({
        mutationFn: (id: string) => notificationApi.markNotificationAsRead(id),
        onSuccess: (_, id) => {
            dispatch({ type: "MARK_AS_READ", id });
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount"] });
        },
    });

    const { mutateAsync: markAllAsReadMutation } = useMutation({
        mutationFn: () => notificationApi.markAllNotificationsAsRead(),
        onSuccess: () => {
            dispatch({ type: "MARK_ALL_AS_READ" });
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount"] });
        },
    });

    // 🔹 Exposed actions
    const clearNotifications = () => {
        dispatch({ type: "CLEAR_NOTIFICATIONS" });
    };

    const value: NotificationContextType = {
        ...state,
        fetchNotifications: async () => {
            dispatch({ type: "SET_LOADING", payload: true });
            await fetchNotifications();
            dispatch({ type: "SET_LOADING", payload: false });
        },
        fetchUnreadCount: async () => {
            dispatch({ type: "SET_LOADING", payload: true });
            await fetchUnreadCount();
            dispatch({ type: "SET_LOADING", payload: false });
        },
        markAsRead: async (id: string) => {
            await markAsReadMutation(id);
        },
        markAllAsRead: async () => {
            await markAllAsReadMutation();
        },
        clearNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within NotificationProvider");
    }
    return context;
};
