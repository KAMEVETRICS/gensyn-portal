// Script to make a user an admin
// Run with: npx ts-node scripts/make-admin.ts <email>

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    })

    console.log(`✅ User ${user.name} (${user.email}) is now an admin!`)
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error(`❌ User with email ${email} not found`)
    } else {
      console.error('Error:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]
if (!email) {
  console.error('Usage: npx ts-node scripts/make-admin.ts <email>')
  process.exit(1)
}

makeAdmin(email)

