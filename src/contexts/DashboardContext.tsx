import { createContext, useContext, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import analyticsApi from '@/api/analytics.api';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { USER_ROLES } from '@/types/user.types';

interface StorageData {
    totalFiles: number;
    totalFolders: number;
    totalSize: number;
    imageCount: number;
    imageSize: number;
    videoCount: number;
    videoSize: number;
    audioCount: number;
    audioSize: number;
    documentCount: number;
    documentSize: number;
    otherCount?: number;
    otherSize?: number;
}

interface TodayActivity {
    uploads: number;
    downloads: number;
    shares: number;
    publicLinks: number;
}

interface StorageOverview {
    storage: StorageData;
    todayActivity: TodayActivity;
    storageQuota: number;
    storageUsed: number;
    storageRemaining: number;
    storageUsedPercentage: string;
}

interface AnalyticsSummary {
    current: any;
    last30Days: any[];
    totalUploads: number;
    totalDownloads: number;
    totalShares: number;
}

interface DashboardContextType {
    storageOverview: StorageOverview | null;
    analyticsSummary: AnalyticsSummary | null;
    isLoading: boolean;
    error: string | null;
    refreshStorageOverview: () => Promise<void>;
    refreshAnalyticsSummary: () => Promise<void>;
    getAnalyticsByDateRange: (startDate: string, endDate: string) => Promise<any>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // 🔹 Queries
    const { data: storageOverview, isLoading: storageOverviewLoading, error: storageOverviewError } = useQuery<StorageOverview>({
        queryKey: ['storageOverview'],
        queryFn: async () => {
            const response = await analyticsApi.getStorageOverview();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch storage overview');
            }
        },
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!user && user.role === USER_ROLES.USER, // Only enable the query when user is authenticated
    });

    const { data: analyticsSummary, isLoading: analyticsSummaryLoading, error: analyticsSummaryError } = useQuery<AnalyticsSummary>({
        queryKey: ['analyticsSummary'],
        queryFn: async () => {
            const response = await analyticsApi.getAnalyticsSummary();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch analytics summary');
            }
        },
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!user && user.role === USER_ROLES.USER, // Only enable the query when user is authenticated
    });

    // 🔹 Refresh functions
    const refreshStorageOverview = useCallback(async () => {
        try {
            await queryClient.refetchQueries({ queryKey: ['storageOverview'] });
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load storage overview';
            console.error('Error fetching storage overview:', err);
            toast.error(errorMsg);
        }
    }, [queryClient]);

    const refreshAnalyticsSummary = useCallback(async () => {
        try {
            await queryClient.refetchQueries({ queryKey: ['analyticsSummary'] });
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load analytics summary';
            console.error('Error fetching analytics summary:', err);
            toast.error(errorMsg);
        }
    }, [queryClient]);

    const getAnalyticsByDateRange = useCallback(async (startDate: string, endDate: string) => {
        try {
            const response = await analyticsApi.getAnalyticsByDateRange(startDate, endDate);

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch analytics');
            }
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load analytics';
            toast.error(errorMsg);
            throw err;
        }
    }, []);

    // Compute combined loading and error states
    const isLoading = storageOverviewLoading || analyticsSummaryLoading;
    const error = storageOverviewError?.message || analyticsSummaryError?.message || null;

    const value: DashboardContextType = {
        storageOverview: storageOverview || null,
        analyticsSummary: analyticsSummary || null,
        isLoading,
        error,
        refreshStorageOverview,
        refreshAnalyticsSummary,
        getAnalyticsByDateRange,
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}

