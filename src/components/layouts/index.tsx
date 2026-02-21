"use client"

import type { ReactNode, FC } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { type UserRole } from "@/types/user.types"
import { DashboardLayout } from "./dashboard-layout"
import { AdminLayout } from "./admin-layout"
import { useAuth } from "@/contexts/useAuth"


// Protected route component
interface ProtectedRouteProps {
    roles: UserRole[];
}


// Default Layout
const DefaultLayout: FC<{ children: ReactNode }> = ({ children }) => (
    <div className="default-layout">
        <header>BookMyShow Clone</header>
        <main>{children}</main>
        <footer>© 2023 BookMyShow Clone</footer>
    </div>
)

// Role-based layout wrapper using switch-case
const RoleBasedLayout: FC = () => {
    const { user } = useAuth();
    const role = user?.role;

    switch (role) {
        case "USER":
            return (
                <DashboardLayout>
                    <Outlet context={{ role }} />
                </DashboardLayout>
            )
        case "ADMIN":
            return (
                <AdminLayout>
                    <Outlet context={{ role }} />
                </AdminLayout>
            )
        default:
            return (
                <DefaultLayout>
                    <Outlet context={{ role: "USER" }} />
                </DefaultLayout>
            )
    }
}


const ProtectedRoute: FC<ProtectedRouteProps> = ({ roles }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (!roles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <RoleBasedLayout />
}

export {
    DefaultLayout,
    ProtectedRoute,
    RoleBasedLayout,
};
