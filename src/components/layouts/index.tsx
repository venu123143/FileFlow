"use client"

import type { ReactNode, FC } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { type UserRole } from "@/types/user.types"
import { DashboardLayout } from "./dashboard-layout"
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

// User Layout
const UserLayout: FC<{ children: ReactNode }> = ({ children }) => (
    <div className="user-layout">
        <nav className="user-nav">User Navigation</nav>
        <main className="user-main">{children}</main>
    </div>
);

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
                <UserLayout>
                    <Outlet context={{ role }} />
                </UserLayout>
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
    UserLayout,
    ProtectedRoute,
    RoleBasedLayout,
};
