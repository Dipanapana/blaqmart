import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StoreSettingsForm } from "./store-settings-form"
import { DeliveryZonesManager } from "./delivery-zones-manager"
import { PaymentSettingsForm } from "./payment-settings-form"

async function getSettings() {
  const settings = await db.storeSetting.findFirst()
  return settings
}

async function getDeliveryZones() {
  return db.deliveryZone.findMany({
    orderBy: { name: "asc" },
  })
}

export default async function AdminSettingsPage() {
  const [settings, deliveryZones] = await Promise.all([
    getSettings(),
    getDeliveryZones(),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store settings and preferences
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Zones</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoreSettingsForm settings={null} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Zones</CardTitle>
              <CardDescription>
                Manage delivery areas and fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeliveryZonesManager
                zones={deliveryZones.map((z) => ({
                  id: z.id,
                  name: z.name,
                  suburbs: typeof z.suburbs === 'string' ? JSON.parse(z.suburbs) : z.suburbs,
                  fee: Number(z.baseFee),
                  estimatedDays: z.estimatedDays,
                  isActive: z.isActive,
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure your payment gateway
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
