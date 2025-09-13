"use client"

import * as React from "react"
import { useLocation, Link } from "react-router-dom"
import { Menu } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { UserDropdown } from "@/components/user/user-dropdown"
import { useAuth } from '@/contexts/useAuth'

interface TopBarProps {
  onSidebarToggle: () => void
}

export function TopBar({ onSidebarToggle }: TopBarProps) {
  const location = useLocation()
  const { user } = useAuth()
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x)

    // Map route names to display names
    const routeNames: Record<string, string> = {
      '': 'Home',
      'all-files': 'All Files',
      'deleted-files': 'Deleted Files',
      'private-files': 'Private Files',
      'shared-files': 'Shared Files',
      'settings': 'Settings'
    }

    const breadcrumbs = [
      { name: 'Home', path: '/' }
    ]

    // Build breadcrumbs based on path
    let currentPath = ''
    pathnames.forEach((pathname) => {
      currentPath += `/${pathname}`
      const name = routeNames[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1)
      breadcrumbs.push({ name, path: currentPath })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <div className="h-16 border-b border-border bg-background px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onSidebarToggle}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          title="Toggle sidebar (Ctrl+B)"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Breadcrumb className="md:block hidden">
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.path}>
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={breadcrumb.path}>{breadcrumb.name}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <UserDropdown name={user?.display_name} email={user?.email} />
    </div>
  )
}
