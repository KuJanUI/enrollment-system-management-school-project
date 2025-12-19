import { NextResponse } from "next/server"
import { clearSessionCookie } from "@/lib/session"

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    clearSessionCookie(response)

    return response
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
