import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET single enrollment
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const enrollment = await db.enrollments.getById(params.id)
    if (!enrollment) {
      return NextResponse.json({ success: false, message: "Enrollment not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: enrollment })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch enrollment" }, { status: 500 })
  }
}

// PUT update enrollment
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const enrollment = await db.enrollments.update(params.id, body)
    if (!enrollment) {
      return NextResponse.json({ success: false, message: "Enrollment not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: enrollment })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update enrollment" }, { status: 500 })
  }
}

// DELETE enrollment
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const success = await db.enrollments.delete(params.id)
    if (!success) {
      return NextResponse.json({ success: false, message: "Enrollment not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: "Enrollment deleted" })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to delete enrollment" }, { status: 500 })
  }
}
