import { SessionProvider } from "next-auth/react"
import { Header } from "@/components/storefront/header"
import { Footer } from "@/components/storefront/footer"
import { MobileNav } from "@/components/storefront/mobile-nav"
import { FloatingWhatsAppButton } from "@/components/shared/whatsapp-button"

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
        <FloatingWhatsAppButton />
      </div>
    </SessionProvider>
  )
}
