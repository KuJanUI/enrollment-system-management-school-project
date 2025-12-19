import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET dashboard statistics
export async function GET() {
  try {
    const students = await db.students.getAll()
    const courses = await db.courses.getAll()
    const enrollments = await db.enrollments.getAll()

    const stats = {
      totalStudents: students.length,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      activeEnrollments: enrollments.filter((e) => e.status === "active").length,
      activeStudents: students.filter((s) => s.status === "active").length,
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch statistics" }, { status: 500 })
  }
}
