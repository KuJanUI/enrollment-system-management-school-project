import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$connect()
    
    const userCount = await prisma.user.count()
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: "Database connected",
      userCount,
      users,
      databaseUrl: process.env.DATABASE_URL?.split('@')[1] // Show DB location (hide password)
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: String(error)
    }, { status: 500 })
  }
}
