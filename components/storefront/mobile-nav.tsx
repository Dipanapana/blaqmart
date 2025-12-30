"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, School, ShoppingCart, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"

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
    href: "/cart",
    icon: ShoppingCart,
    label: "Cart",
    showBadge: true,
  },
  {
    href: "/orders",
    icon: User,
    label: "Account",
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const { items } = useCart()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

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
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.showBadge && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
