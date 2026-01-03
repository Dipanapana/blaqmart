/**
 * Fix Admin User for Production
 *
 * Run with: npx tsx scripts/fix-admin-production.ts
 *
 * This will:
 * 1. Check if admin user exists
 * 2. Create or update admin with known password
 */

import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminEmail = "admin@blaqmart.co.za"
  const adminPassword = "Admin123!"

  console.log("🔍 Checking for admin user...")

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log("✅ Admin user found:", existingAdmin.email)
    console.log("   Role:", existingAdmin.role)
    console.log("   Created:", existingAdmin.createdAt)

    // Reset password
    console.log("\n🔄 Resetting password...")
    const hashedPassword = await hash(adminPassword, 12)

    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        passwordHash: hashedPassword,
        role: "ADMIN" // Ensure role is ADMIN
      },
    })

    console.log("✅ Password reset successfully!")
  } else {
    console.log("❌ Admin user NOT found. Creating...")

    const hashedPassword = await hash(adminPassword, 12)

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        passwordHash: hashedPassword,
        role: "ADMIN",
      },
    })

    console.log("✅ Admin user created!")
  }

  console.log("\n📋 Login credentials:")
  console.log("   Email:", adminEmail)
  console.log("   Password:", adminPassword)
  console.log("\n🌐 Try logging in at: https://www.blaqmart.co.za/login")
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
