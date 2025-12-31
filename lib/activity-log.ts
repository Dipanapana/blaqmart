import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Prisma } from "@prisma/client"

export type ActionType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "STATUS_CHANGE"
  | "VIEW"
  | "LOGIN"
  | "LOGOUT"

export type EntityType =
  | "ORDER"
  | "PRODUCT"
  | "SCHOOL"
  | "CATEGORY"
  | "USER"
  | "STATIONERY"
  | "GRADE"
  | "HAMPER"
  | "SETTING"

interface LogActivityParams {
  action: ActionType
  entityType: EntityType
  entityId: string
  entityName?: string
  details?: Prisma.InputJsonValue
  userId?: string // Optional override for when session not available
}

/**
 * Log an admin activity to the database.
 * Automatically captures user from session, IP address, and user agent.
 *
 * @example
 * await logActivity({
 *   action: "STATUS_CHANGE",
 *   entityType: "ORDER",
 *   entityId: order.id,
 *   entityName: `Order #${order.orderNumber}`,
 *   details: { fromStatus: "PENDING", toStatus: "PROCESSING" }
 * })
 */
export async function logActivity(params: LogActivityParams) {
  try {
    // Get user from session or use provided userId
    let userId = params.userId

    if (!userId) {
      const session = await auth()
      userId = session?.user?.id
    }

    if (!userId) {
      console.warn("logActivity: No user ID available, skipping activity log")
      return null
    }

    // Get request metadata
    let ipAddress: string | null = null
    let userAgent: string | null = null

    try {
      const headersList = await headers()
      ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip")
      userAgent = headersList.get("user-agent")
    } catch {
      // Headers not available (e.g., in scripts)
    }

    const activityLog = await db.activityLog.create({
      data: {
        userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        details: params.details,
        ipAddress,
        userAgent,
      },
    })

    return activityLog
  } catch (error) {
    console.error("Failed to log activity:", error)
    return null
  }
}

/**
 * Get recent activity logs with user info
 */
export async function getRecentActivity(limit: number = 15) {
  return db.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })
}

/**
 * Get activity logs for a specific entity
 */
export async function getEntityActivity(entityType: EntityType, entityId: string) {
  return db.activityLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

/**
 * Get activity logs for a specific user
 */
export async function getUserActivity(userId: string, limit: number = 50) {
  return db.activityLog.findMany({
    where: { userId },
    take: limit,
    orderBy: { createdAt: "desc" },
  })
}

/**
 * Format action for display
 */
export function formatAction(action: ActionType): string {
  const actionMap: Record<ActionType, string> = {
    CREATE: "created",
    UPDATE: "updated",
    DELETE: "deleted",
    STATUS_CHANGE: "changed status of",
    VIEW: "viewed",
    LOGIN: "logged in",
    LOGOUT: "logged out",
  }
  return actionMap[action] || action.toLowerCase()
}

/**
 * Get entity link for navigation
 */
export function getEntityLink(entityType: EntityType, entityId: string): string {
  const linkMap: Record<EntityType, string> = {
    ORDER: `/admin/orders/${entityId}`,
    PRODUCT: `/admin/products/${entityId}`,
    SCHOOL: `/admin/schools/${entityId}`,
    CATEGORY: `/admin/categories/${entityId}`,
    USER: `/admin/users/${entityId}`,
    STATIONERY: `/admin/schools`,
    GRADE: `/admin/grades`,
    HAMPER: `/admin/hampers/${entityId}`,
    SETTING: `/admin/settings`,
  }
  return linkMap[entityType] || "/admin"
}
