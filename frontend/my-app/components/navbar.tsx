"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Livability", href: "/livability" },
  { label: "Resilience", href: "/resilience" },
  { label: "Reports", href: "/reports" },
  { label: "Timeline", href: "/timeline" },
  { label: "Wards", href: "/wards" },
  { label: "Overview", href: "/overview" },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-gray-900/40 backdrop-blur-lg">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EP</span>
            </div>
            <span className="font-bold text-lg">Eco-City Pulse</span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`relative ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {item.label}
                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              <span>Admin User</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
