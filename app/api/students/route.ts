import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const studentsFromDB = await prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        },
        enrollments: {
          include: {
            course: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform to match UI expected format
    const students = studentsFromDB.map(student => ({
      id: student.id.toString(),
      studentId: student.studentId,
      name: student.user.name,
      email: student.user.email,
      phone: (student as any).phone || '',
      dateOfBirth: (student as any).dateOfBirth || '',
      address: (student as any).address || '',
      enrollmentDate: student.createdAt.toISOString().split('T')[0],
      status: ((student as any).status || 'active') as "active" | "inactive" | "graduated",
      year: student.year || 1,
    }))
    return NextResponse.json({ success: true, students })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// POST create new student (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { studentId, name, email, password, phone, dateOfBirth, address, status } = body

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ success: false, message: "User with this email already exists" }, { status: 400 })
    }

    // Check if studentId already exists
    if (studentId) {
      const existingStudent = await prisma.student.findUnique({
        where: { studentId }
      })

      if (existingStudent) {
        return NextResponse.json({ success: false, message: "Student ID already exists" }, { status: 400 })
      }
    }

    // Validate password
    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and student in transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'student'
        }
      })

      const newStudent = await tx.student.create({
        data: {
          userId: newUser.id,
          studentId: studentId || `STU${Date.now()}`,
          phone: phone || null,
          dateOfBirth: dateOfBirth || null,
          address: address || null,
          status: status || 'active',
          year: 1
        },
        include: {
          user: true
        }
      })

      return newStudent
    })

    return NextResponse.json({ 
      success: true, 
      student: result,
      message: "Student created successfully"
    })
  } catch (error) {
    console.error('Error creating student:', error)
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
    const { studentId, name, email, password, phone, dateOfBirth, address, status, major, year, gpa } = body

    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      include: { user: true }
    })

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    if (user.role !== 'admin' && student.userId !== user.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    if (email && email !== student.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUser && existingUser.id !== student.userId) {
        return NextResponse.json({ success: false, message: "Email already in use" }, { status: 400 })
      }
    }

    let hashedPassword: string | undefined
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 })
      }
      hashedPassword = await bcrypt.hash(password, 10)
    }

    const updatedStudent = await prisma.$transaction(async (tx) => {
      const userData: { name?: string; email?: string; password?: string } = {}
      if (name) {
        userData.name = name
      }
      if (email) {
        userData.email = email
      }
      if (hashedPassword) {
        userData.password = hashedPassword
      }
      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: student.userId },
          data: userData,
        })
      }

      // Update student info
      return await tx.student.update({
        where: { id: parseInt(studentId) },
        data: {
          ...(phone !== undefined && { phone }),
          ...(dateOfBirth !== undefined && { dateOfBirth }),
          ...(address !== undefined && { address }),
          ...(status && { status }),
          ...(major !== undefined && { major }),
          ...(year && { year: parseInt(year) }),
          ...(gpa !== undefined && { gpa: gpa ? parseFloat(gpa) : null })
        },
        include: {
          user: true
        }
      })
    })

    return NextResponse.json({ success: true, student: updatedStudent })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing student ID" }, { status: 400 })
    }
    
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      select: { userId: true }
    })

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    // Delete the user, which will cascade delete the student due to onDelete: Cascade
    await prisma.user.delete({
      where: { id: student.userId }
    })

    return NextResponse.json({ success: true, message: "Student and associated user deleted successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
