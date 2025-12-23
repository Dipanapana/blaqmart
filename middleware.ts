import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === "ADMIN"

  // Admin routes protection
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  // Protected customer routes
  const protectedRoutes = ["/orders", "/account"]
  if (protectedRoutes.some((route) => nextUrl.pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl)
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/orders/:path*", "/account/:path*"],
}
