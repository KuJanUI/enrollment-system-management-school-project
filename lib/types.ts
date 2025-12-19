export type Student = {
  id: string
  studentId: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  enrollmentDate: string
  status: "active" | "inactive" | "graduated"
}

export type Course = {
  id: string
  courseCode: string
  courseName: string
  description: string
  credits: number
  instructor: string
  capacity: number
  schedule: string
  semester: string
  status: "active" | "inactive"
}

export type Enrollment = {
  id: string
  studentId: string
  courseId: string
  enrollmentDate: string
  status: "active" | "completed" | "dropped"
  grade?: string
  studentName?: string
  studentEmail?: string
  courseCode?: string
  courseName?: string
  instructorName?: string
}
