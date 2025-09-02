
import { type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error/ErrorBoundry";
import { UploadProvider } from "@/contexts/UploadContext";
// import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/useAuth";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { FileProvider } from "@/contexts/fileContext";  

const queryClient = new QueryClient();

const AppProviders = ({ children }: { children: ReactNode }) => {
    const providers = [
        (children: ReactNode) => <BrowserRouter>{children}</BrowserRouter>,
        (children: ReactNode) => <ErrorBoundary>{children}</ErrorBoundary>,
        (children: ReactNode) => <UploadProvider>{children}</UploadProvider>,
        (children: ReactNode) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
        (children: ReactNode) => (
            <>
                <Sonner />
                {children}
            </>
        ),
        (children: ReactNode) => <AuthProvider>{children}</AuthProvider>,
        (children: ReactNode) => <FileProvider>{children}</FileProvider>,
    ];

    return providers.reduceRight((acc, Provider) => Provider(acc), children);
};

export default AppProviders;
