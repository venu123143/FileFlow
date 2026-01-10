import apiClient from "@/api/axios";

/**
 * Get analytics summary (last 30 days)
 */
const getAnalyticsSummary = async () => {
    const response = await apiClient.get("/analytics/summary");
    return response.data;
};

/**
 * Get analytics by date range
 */
const getAnalyticsByDateRange = async (startDate: string, endDate: string) => {
    const response = await apiClient.get("/analytics/date-range", {
        params: { startDate, endDate }
    });
    return response.data;
};

/**
 * Get current storage overview
 */
const getStorageOverview = async () => {
    const response = await apiClient.get("/analytics/storage");
    return response.data;
};

export default {
    getAnalyticsSummary,
    getAnalyticsByDateRange,
    getStorageOverview,
};

