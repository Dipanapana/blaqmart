"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Gift,
  Settings,
  LogOut,
  Menu,
  X,
  Tag,
  School,
} from "lucide-react"
import { useState } from "react"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/schools", icon: School, label: "Schools" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/categories", icon: Tag, label: "Categories" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/hampers", icon: Gift, label: "Hampers" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-50 rounded-md bg-background p-2 shadow-md lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-background transition-transform lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Logo />
            <span className="ml-2 text-xs text-muted-foreground">Admin</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Back to Store
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
