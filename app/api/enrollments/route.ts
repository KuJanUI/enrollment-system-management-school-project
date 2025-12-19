import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

// GET enrollments (admin: all, student: own only)
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    let enrollments

    if (user.role === 'admin') {
      enrollments = await prisma.enrollment.findMany({
        include: {
          student: { 
            include: { user: true } 
          },
          course: true
        },
        orderBy: { enrollmentDate: 'desc' }
      })
    } else if (user.studentId) {
      enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.studentId },
        include: { 
          course: true,
          student: {
            include: { user: true }
          }
        },
        orderBy: { enrollmentDate: 'desc' }
      })
    } else {
      return NextResponse.json({ success: false, message: "Missing student ID" }, { status: 400 })
    }

    const transformedEnrollments = enrollments.map((enrollment: any) => ({
      id: enrollment.id.toString(),
      studentId: enrollment.studentId.toString(),
      courseId: enrollment.courseId.toString(),
      enrollmentDate: enrollment.enrollmentDate.toISOString().split('T')[0],
      status: enrollment.status,
      grade: enrollment.grade || '',
      studentName: enrollment.student?.user?.name || 'Unknown',
      studentEmail: enrollment.student?.user?.email || '',
      courseCode: enrollment.course?.code || '',
      courseName: enrollment.course?.name || '',
    }))
    return NextResponse.json({ success: true, enrollments: transformedEnrollments })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { enrollmentId, status, grade } = body

    if (!enrollmentId) {
      return NextResponse.json({ success: false, message: "Missing enrollment ID" }, { status: 400 })
    }

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (grade !== undefined) updateData.grade = grade

    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: {
        student: {
          include: {
            user: true
          }
        },
        course: true
      }
    })

    const transformedEnrollment = {
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      status: enrollment.status,
      grade: enrollment.grade,
      enrollmentDate: enrollment.enrollmentDate,
      studentName: enrollment.student.user.name,
      studentEmail: enrollment.student.user.email,
      courseCode: enrollment.course.code,
      courseName: enrollment.course.name
    }

    return NextResponse.json({ success: true, enrollment: transformedEnrollment })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// POST enroll in course (student can enroll)
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, studentId: requestStudentId } = body
    
    // Admin can specify studentId, student uses their own from session
    const studentId = user.role === 'admin' && requestStudentId 
      ? parseInt(requestStudentId) 
      : user.studentId
    
    // Debug logging
    console.log('Enrollment request:', { body, studentId, courseId, userRole: user.role })
    
    if (!studentId) {
      return NextResponse.json({ 
        success: false, 
        message: user.role === 'student' 
          ? "Student ID not found in session. Please log out and log back in." 
          : "Student ID is required for admin enrollment" 
      }, { status: 400 })
    }
    
    if (!courseId) {
      return NextResponse.json({ success: false, message: "Course ID is required" }, { status: 400 })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentId,
          courseId: parseInt(courseId)
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({ success: false, message: "Already enrolled in this course" }, { status: 400 })
    }

    // Check if course exists and is available
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) }
    })

    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 })
    }

    if (course.status !== 'active') {
      return NextResponse.json({ success: false, message: "Course is not active" }, { status: 400 })
    }

    if (course.currentEnrollment >= course.maxCapacity) {
      return NextResponse.json({ success: false, message: "Course is full" }, { status: 400 })
    }

    // Create enrollment and update course count in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          studentId: studentId,
          courseId: parseInt(courseId),
        },
        include: { course: true }
      })

      await tx.course.update({
        where: { id: parseInt(courseId) },
        data: { currentEnrollment: { increment: 1 } }
      })

      return enrollment
    })

    return NextResponse.json({ success: true, enrollment: result })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Enrollment failed" }, { status: 500 })
  }
}

// DELETE drop enrollment (student can drop)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('enrollmentId')

    if (!enrollmentId) {
      return NextResponse.json({ success: false, message: "Missing enrollment ID" }, { status: 400 })
    }

    // Get enrollment to verify ownership and get course ID
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollmentId) }
    })

    if (!enrollment) {
      return NextResponse.json({ success: false, message: "Enrollment not found" }, { status: 404 })
    }

    // Verify student owns this enrollment (if not admin)
    if (user.role !== 'admin' && enrollment.studentId !== user.studentId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // Delete enrollment and update course count in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.enrollment.delete({
        where: { id: parseInt(enrollmentId) }
      })

      await tx.course.update({
        where: { id: enrollment.courseId },
        data: { currentEnrollment: { decrement: 1 } }
      })
    })

    return NextResponse.json({ success: true, message: "Enrollment dropped successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to drop enrollment" }, { status: 500 })
  }
}
