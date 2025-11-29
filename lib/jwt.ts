import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string; email: string }
  } catch (error) {
    return null
  }
}

