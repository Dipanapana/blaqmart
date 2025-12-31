import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "admin@blaqmart.co.za"
  const testPassword = "admin123"

  console.log(`Checking user: ${email}`)

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  })

  if (!user) {
    console.log("User NOT FOUND!")
    return
  }

  console.log(`Found user:`)
  console.log(`  ID: ${user.id}`)
  console.log(`  Email: ${user.email}`)
  console.log(`  Name: ${user.name}`)
  console.log(`  Role: ${user.role}`)
  console.log(`  Has password: ${!!user.passwordHash}`)

  if (user.passwordHash) {
    const isValid = await compare(testPassword, user.passwordHash)
    console.log(`  Password "admin123" valid: ${isValid}`)
  }
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
