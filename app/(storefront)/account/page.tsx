import { redirect } from "next/navigation"
import Link from "next/link"
import {
  User,
  MapPin,
  Package,
  ChevronRight,
  Phone,
  Mail,
  Home,
  Trash2,
} from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatPrice, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteAddressButton } from "@/components/account/delete-address-button"

const statusColors: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  PENDING: "warning",
  CONFIRMED: "secondary",
  PREPARING: "secondary",
  READY: "secondary",
  OUT_FOR_DELIVERY: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
}

async function getUserData(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      addresses: {
        orderBy: { isDefault: "desc" },
      },
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      },
    },
  })
}

export default async function AccountPage() {
  const session = await auth()

  if (!session) {
    redirect("/login?callbackUrl=/account")
  }

  const user = await getUserData(session.user.id)

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            My Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.name || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{user.phone || "Not set"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Addresses */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            My Addresses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.addresses.length === 0 ? (
            <div className="text-center py-8">
              <Home className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                No saved addresses yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Your delivery address will be saved automatically when you place
                an order.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {user.addresses.map((address) => (
                <div
                  key={address.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {address.label && (
                        <Badge variant="outline">{address.label}</Badge>
                      )}
                      {address.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="font-medium">{address.recipientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.streetAddress}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.suburb}, {address.city}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.province}, {address.postalCode}
                    </p>
                    {address.phone && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.phone}
                      </p>
                    )}
                  </div>
                  <DeleteAddressButton addressId={address.id} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Orders
          </CardTitle>
          {user.orders.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/orders">View All</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {user.orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No orders yet.</p>
              <Button asChild>
                <Link href="/schools">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {user.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)} · {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(Number(order.total))}
                      </p>
                      <Badge variant={statusColors[order.status]}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-2">Need help with your order?</p>
        <Button variant="outline" asChild>
          <a
            href="https://wa.me/27794022296?text=Hi%20Blaqmart!%20I%20need%20help%20with%20my%20order."
            target="_blank"
            rel="noopener noreferrer"
          >
            <Phone className="mr-2 h-4 w-4" />
            WhatsApp Support
          </a>
        </Button>
      </div>
    </div>
  )
}
