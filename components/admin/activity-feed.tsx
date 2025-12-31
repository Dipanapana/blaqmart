"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  Package,
  ShoppingCart,
  School,
  User,
  Settings,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Eye,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ActivityLogItem = {
  id: string
  action: string
  entityType: string
  entityId: string
  entityName: string | null
  details: Record<string, unknown> | null
  createdAt: Date
  user: {
    name: string | null
    email: string
  }
}

interface ActivityFeedProps {
  activities: ActivityLogItem[]
}

const actionIcons: Record<string, typeof Activity> = {
  CREATE: TrendingUp,
  UPDATE: Edit,
  DELETE: Trash2,
  STATUS_CHANGE: TrendingDown,
  VIEW: Eye,
}

const entityIcons: Record<string, typeof Activity> = {
  ORDER: ShoppingCart,
  PRODUCT: Package,
  SCHOOL: School,
  USER: User,
  SETTING: Settings,
}

function getEntityLink(activity: ActivityLogItem): string {
  switch (activity.entityType) {
    case "ORDER":
      return `/admin/orders/${activity.entityId}`
    case "PRODUCT":
      return `/admin/products/${activity.entityId}/edit`
    case "SCHOOL":
      return `/admin/schools/${activity.entityId}/edit`
    default:
      return "#"
  }
}

function formatAction(action: string): string {
  switch (action) {
    case "CREATE":
      return "created"
    case "UPDATE":
      return "updated"
    case "DELETE":
      return "deleted"
    case "STATUS_CHANGE":
      return "changed status of"
    case "VIEW":
      return "viewed"
    default:
      return action.toLowerCase()
  }
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            No activity recorded yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const ActionIcon = actionIcons[activity.action] || Activity
            const EntityIcon = entityIcons[activity.entityType] || Package

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 text-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <EntityIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">
                      {activity.user.name || activity.user.email}
                    </span>{" "}
                    {formatAction(activity.action)}{" "}
                    <Link
                      href={getEntityLink(activity)}
                      className="text-primary hover:underline"
                    >
                      {activity.entityName || activity.entityType.toLowerCase()}
                    </Link>
                    {activity.action === "STATUS_CHANGE" &&
                      activity.details &&
                      typeof activity.details === "object" &&
                      "toStatus" in activity.details && (
                        <span className="text-muted-foreground">
                          {" "}
                          to {String(activity.details.toStatus).replace(/_/g, " ")}
                        </span>
                      )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
