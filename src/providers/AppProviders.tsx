
import { type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error/ErrorBoundry";
import { UploadProvider } from "@/contexts/UploadContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/useAuth";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { FileProvider } from "@/contexts/fileContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationUIProvider } from "@/contexts/NotificationUIContext";
import { SocketProvider } from "@/contexts/SocketContext";

import { ApiTokenProvider } from "@/contexts/ApiTokenContext";

const queryClient = new QueryClient({
    defaultOptions: {
        mutations: {
            retry: 0, // Don't auto-retry upload mutations
            onError: (error) => {
                console.error('Mutation error:', error);
            }
        },
        queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
        }
    }
});

const AppProviders = ({ children }: { children: ReactNode }) => {
    const providers = [
        (children: ReactNode) => <BrowserRouter>{children}</BrowserRouter>,
        (children: ReactNode) => <ErrorBoundary>{children}</ErrorBoundary>,
        (children: ReactNode) => <ThemeProvider>{children}</ThemeProvider>,
        (children: ReactNode) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
        (children: ReactNode) => <UploadProvider>{children}</UploadProvider>,
        (children: ReactNode) => <SocketProvider>{children}</SocketProvider>,
        (children: ReactNode) => (
            <>
                <Sonner />
                {children}
            </>
        ),
        (children: ReactNode) => <AuthProvider>{children}</AuthProvider>,
        (children: ReactNode) => <ApiTokenProvider>{children}</ApiTokenProvider>,
        (children: ReactNode) => <FileProvider>{children}</FileProvider>,
        (children: ReactNode) => <NotificationUIProvider>{children}</NotificationUIProvider>,
        (children: ReactNode) => <NotificationProvider>{children}</NotificationProvider>,

    ];

    return providers.reduceRight((acc, Provider) => Provider(acc), children);
};

export default AppProviders;
