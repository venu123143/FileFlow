"use client"

import { ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BreadcrumbProps {
    path: string[]
    onNavigate: (index: number) => void
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
    return (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" onClick={() => onNavigate(-1)} className="h-8 px-2 hover:text-foreground">
                <Home className="h-4 w-4" />
            </Button>

            {path.length > 0 && <ChevronRight className="h-4 w-4" />}

            {path.map((folder, index) => (
                <div key={index} className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate(index)}
                        className="h-8 px-2 hover:text-foreground"
                    >
                        {folder}
                    </Button>
                    {index < path.length - 1 && <ChevronRight className="h-4 w-4" />}
                </div>
            ))}
        </nav>
    )
}
