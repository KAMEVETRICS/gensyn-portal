import { getCurrentUser } from './jwt'
import { prisma } from './prisma'

export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { isAdmin: true },
    })

    return userData?.isAdmin || false
  } catch (error) {
    return false
  }
}

export async function getAdminUser() {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    })

    if (!userData || !userData.isAdmin) return null
    return userData
  } catch (error) {
    return null
  }
}

