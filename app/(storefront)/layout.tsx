import { SessionProvider } from "next-auth/react"
import { Header } from "@/components/storefront/header"
import { Footer } from "@/components/storefront/footer"
import { MobileNav } from "@/components/storefront/mobile-nav"

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileNav />
      </div>
    </SessionProvider>
  )
}
