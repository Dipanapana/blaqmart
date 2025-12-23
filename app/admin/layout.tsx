import { SessionProvider } from "next-auth/react"
import { AdminSidebar } from "@/components/admin/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 overflow-auto bg-muted/30 p-8">{children}</main>
      </div>
    </SessionProvider>
  )
}
