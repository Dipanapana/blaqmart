import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Truck, MapPin, Clock, Check, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Delivery Information | Blaqmart Stationery",
  description: "Delivery areas, fees, and timeframes for Blaqmart Stationery in Northern Cape and Free State.",
}

const deliveryZones = [
  { town: "Warrenton", type: "Local", fee: "FREE", time: "Same day", cod: true },
  { town: "Jan Kempdorp", type: "Local", fee: "FREE", time: "Same day", cod: true },
  { town: "Hartswater", type: "Courier", fee: "R50", time: "1-2 days", cod: false },
  { town: "Christiana", type: "Courier", fee: "R50", time: "1-2 days", cod: false },
  { town: "Bloemhof", type: "Courier", fee: "R50", time: "1-2 days", cod: false },
  { town: "Kimberley", type: "Courier", fee: "R75", time: "2-3 days", cod: false },
  { town: "Douglas", type: "Courier", fee: "R60", time: "2-3 days", cod: false },
  { town: "Barkly West", type: "Courier", fee: "R60", time: "2-3 days", cod: false },
]

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 py-8 text-white">
        <div className="container px-4">
          <Button variant="ghost" size="sm" className="mb-4 text-white/80 hover:text-white" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Truck className="h-8 w-8" />
            Delivery Information
          </h1>
          <p className="mt-2 text-white/80 max-w-xl">
            We deliver to Warrenton, Jan Kempdorp, and surrounding areas in the Northern Cape and Free State.
          </p>
        </div>
      </div>

      <div className="container px-4 py-10">
        {/* Key Info Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">🚚</div>
              <h3 className="font-bold text-green-800">Free Local Delivery</h3>
              <p className="text-sm text-green-700 mt-1">Warrenton & Jan Kempdorp</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-bold text-blue-800">Same Day Delivery</h3>
              <p className="text-sm text-blue-700 mt-1">Order before 2pm</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">💵</div>
              <h3 className="font-bold text-amber-800">Cash on Delivery</h3>
              <p className="text-sm text-amber-700 mt-1">Local areas only</p>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Zones */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Delivery Areas & Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Town</th>
                    <th className="text-left py-3 px-4 font-semibold">Delivery Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Fee</th>
                    <th className="text-left py-3 px-4 font-semibold">Timeframe</th>
                    <th className="text-left py-3 px-4 font-semibold">COD</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryZones.map((zone) => (
                    <tr key={zone.town} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium">{zone.town}</td>
                      <td className="py-3 px-4">
                        <Badge variant={zone.type === "Local" ? "default" : "secondary"}>
                          {zone.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={zone.fee === "FREE" ? "text-green-600 font-bold" : ""}>
                          {zone.fee}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{zone.time}</td>
                      <td className="py-3 px-4">
                        {zone.cod ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              * Free delivery on orders over R500 to all areas
            </p>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              How Delivery Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-1">Place Your Order</h3>
                <p className="text-sm text-muted-foreground">
                  Browse our products and checkout with your preferred payment method.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-1">We Prepare Your Order</h3>
                <p className="text-sm text-muted-foreground">
                  Orders placed before 2pm are prepared same day for local delivery.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-1">Delivered to Your Door</h3>
                <p className="text-sm text-muted-foreground">
                  Our driver delivers to your address. Pay on delivery if you chose COD.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* School Collection */}
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🏫</div>
              <div>
                <h3 className="font-bold text-lg mb-2">School Collection Available!</h3>
                <p className="text-muted-foreground mb-4">
                  We can deliver your order directly to your child&apos;s school at our partner locations.
                  Simply select &quot;Collect at School&quot; during checkout and we&apos;ll handle the rest.
                  This option is completely free!
                </p>
                <Button asChild>
                  <Link href="/stationery-packs">View Stationery Packs</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
