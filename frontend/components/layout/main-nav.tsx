"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CalendarDays, Home, Users, UserRound } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="mr-2 h-4 w-4" />,
      active: pathname === "/",
    },
    {
      href: "/admin",
      label: "Admin",
      icon: <Users className="mr-2 h-4 w-4" />,
      active: pathname.startsWith("/admin"),
    },
    {
      href: "/doctor",
      label: "Doctor",
      icon: <UserRound className="mr-2 h-4 w-4" />,
      active: pathname.startsWith("/doctor"),
    },
    {
      href: "/patient",
      label: "Patient",
      icon: <CalendarDays className="mr-2 h-4 w-4" />,
      active: pathname.startsWith("/patient"),
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
          )}
        >
          {route.icon}
          {route.label}
        </Link>
      ))}
    </nav>
  )
}

