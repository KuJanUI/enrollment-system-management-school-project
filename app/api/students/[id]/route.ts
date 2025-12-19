import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET single student
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const student = await db.students.getById(params.id)
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: student })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch student" }, { status: 500 })
  }
}

// PUT update student
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const student = await db.students.update(params.id, body)
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: student })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update student" }, { status: 500 })
  }
}

// DELETE student
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const success = await db.students.delete(params.id)
    if (!success) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: "Student deleted" })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to delete student" }, { status: 500 })
  }
}
