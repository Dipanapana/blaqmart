"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, School, Gift, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/",
    icon: Home,
    label: "Home",
  },
  {
    href: "/schools",
    icon: School,
    label: "Schools",
  },
  {
    href: "/hamper-builder",
    icon: Gift,
    label: "Hamper",
  },
  {
    href: "/orders",
    icon: User,
    label: "Orders",
  },
]

export function MobileNav() {
  const pathname = usePathname()

  // Don't show on admin pages
  if (pathname.startsWith("/admin")) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
