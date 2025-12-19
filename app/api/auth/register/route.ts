import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createSessionToken, setSessionCookie, getSessionUser } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "admin",
      }
    })

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'admin' | 'student',
    }

    // Create JWT token
    const token = await createSessionToken(sessionUser)

    // Set httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    setSessionCookie(response, token)

    return response
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
