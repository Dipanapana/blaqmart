/**
 * Reset admin password script
 *
 * Run with: npx tsx scripts/reset-admin-password.ts
 *
 * Make sure DATABASE_URL environment variable is set
 */

import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "admin@blaqmart.co.za"
  const newPassword = "admin123" // Default password

  console.log(`Resetting password for ${email}...`)

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    console.log("Admin user not found. Creating...")

    const passwordHash = await hash(newPassword, 12)
    const newUser = await prisma.user.create({
      data: {
        email,
        name: "Admin",
        passwordHash,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    })

    console.log(`Created admin user: ${newUser.email}`)
  } else {
    console.log(`Found user: ${user.email} (role: ${user.role})`)

    const passwordHash = await hash(newPassword, 12)
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    })

    console.log(`Password reset successfully!`)
  }

  console.log(`\nLogin credentials:`)
  console.log(`  Email: ${email}`)
  console.log(`  Password: ${newPassword}`)
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
