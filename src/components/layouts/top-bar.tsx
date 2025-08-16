"use client"

import * as React from "react"
import { useLocation, Link } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { UserDropdown } from "@/components/user/user-dropdown"

export function TopBar() {
  const location = useLocation()

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
      <Breadcrumb>
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

      <UserDropdown />
    </div>
  )
}
