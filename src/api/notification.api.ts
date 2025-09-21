// src/api/notification.ts
import apiClient from "@/api/axios";

const getUserNotifications = async (params?: { limit?: number; offset?: number; unreadOnly?: boolean; }) => {
    const response = await apiClient.get("/notification", { params });
    return response.data;
};

const getUnreadNotificationsCount = async () => {
    const response = await apiClient.get("/notification/unread-count");
    return response.data;
};

const markNotificationAsRead = async (notificationId: string) => {
    const response = await apiClient.patch(`/notification/${notificationId}/read`);
    return response.data;
};

const markAllNotificationsAsRead = async () => {
    const response = await apiClient.patch("/notification/mark-all-read");
    return response.data;
};

export default {
    getUserNotifications,
    getUnreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
};
