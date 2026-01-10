import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import analyticsApi from '@/api/analytics.api';
import { toast } from 'sonner';

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
    const [storageOverview, setStorageOverview] = useState<StorageOverview | null>(null);
    const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshStorageOverview = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await analyticsApi.getStorageOverview();
            
            if (response.success) {
                setStorageOverview(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch storage overview');
            }
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load storage overview';
            setError(errorMsg);
            console.error('Error fetching storage overview:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshAnalyticsSummary = useCallback(async () => {
        try {
            setError(null);
            const response = await analyticsApi.getAnalyticsSummary();
            
            if (response.success) {
                setAnalyticsSummary(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch analytics summary');
            }
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load analytics summary';
            setError(errorMsg);
            console.error('Error fetching analytics summary:', err);
        }
    }, []);

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

    // Initial data load
    useEffect(() => {
        const loadInitialData = async () => {
            await Promise.all([
                refreshStorageOverview(),
                refreshAnalyticsSummary()
            ]);
        };

        loadInitialData();
    }, [refreshStorageOverview, refreshAnalyticsSummary]);

    const value: DashboardContextType = {
        storageOverview,
        analyticsSummary,
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

