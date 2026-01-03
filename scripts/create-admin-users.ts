/**
 * Create Admin Users for Blaqmart
 *
 * Run with: npx tsx scripts/create-admin-users.ts
 *
 * Creates 6 admin accounts with role ADMIN
 */

import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

const adminUsers = [
  { email: "thabang@blaqmart.co.za", name: "Thabang" },
  { email: "kgosi@blaqmart.co.za", name: "Kgosi" },
  { email: "tirelo@blaqmart.co.za", name: "Tirelo" },
  { email: "sizwe@blaqmart.co.za", name: "Sizwe" },
  { email: "fifa@blaqmart.co.za", name: "Fifa" },
  { email: "fifi@blaqmart.co.za", name: "Fifi" },
]

const defaultPassword = "Admin123!"

async function main() {
  console.log("🔐 Creating admin users...\n")

  const hashedPassword = await hash(defaultPassword, 12)

  for (const user of adminUsers) {
    try {
      const result = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          passwordHash: hashedPassword,
          role: "ADMIN",
          name: user.name,
        },
        create: {
          email: user.email,
          name: user.name,
          passwordHash: hashedPassword,
          role: "ADMIN",
          emailVerified: new Date(),
        },
      })

      console.log(`✅ ${user.name} (${user.email}) - Created/Updated`)
    } catch (error) {
      console.error(`❌ ${user.name} (${user.email}) - Failed:`, error)
    }
  }

  console.log("\n📋 All admin credentials:")
  console.log("   Password: Admin123!")
  console.log("\n🌐 Login at: https://www.blaqmart.co.za/login")
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
