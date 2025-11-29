import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'

export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json(
        { isAdmin: false },
        { status: 403 }
      )
    }

    return NextResponse.json({ isAdmin: true })
  } catch (error) {
    return NextResponse.json(
      { isAdmin: false },
      { status: 403 }
    )
  }
}

