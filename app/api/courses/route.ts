import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    
    const coursesFromDB = await prisma.course.findMany({
      where: { status: 'active' },
      orderBy: { code: 'asc' }
    })

    const courses = coursesFromDB.map(course => ({
      id: course.id.toString(),
      courseCode: course.code,
      courseName: course.name,
      description: course.description || '',
      credits: course.credits,
      instructor: course.instructor || '',
      capacity: course.maxCapacity,
      schedule: course.schedule || '',
      semester: course.semester || '',
      status: course.status as "active" | "inactive",
    }))

    return NextResponse.json({ success: true, courses })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { code, name, description, credits, instructor, maxCapacity, schedule, semester } = body


    const course = await prisma.course.create({
      data: {
        code,
        name,
        description,
        credits: parseInt(credits),
        instructor,
        maxCapacity: parseInt(maxCapacity),
        schedule,
        semester,
      }
    })

    return NextResponse.json({ success: true, course })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { courseId, ...updateData } = body
    const course = await prisma.course.update({
      where: { id: parseInt(courseId) },
      data: updateData
    })

    return NextResponse.json({ success: true, course })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    if (!courseId) {
      return NextResponse.json({ success: false, message: "Missing course ID" }, { status: 400 })
    }

    await prisma.course.delete({
      where: { id: parseInt(courseId) }
    })

    return NextResponse.json({ success: true, message: "Course deleted successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
