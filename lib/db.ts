// Mock database - Replace with actual MySQL connection later
// Example: import { neon } from '@neondatabase/serverless'
// const sql = neon(process.env.DATABASE_URL)

import type { Student, Course, Enrollment } from "./types"

const students: Student[] = [
  {
    id: "1",
    studentId: "STU001",
    name: "John Doe",
    email: "john.doe@university.edu",
    phone: "+1234567890",
    dateOfBirth: "2000-01-15",
    address: "123 Main St, City, State 12345",
    enrollmentDate: "2023-09-01",
    status: "active",
  },
  {
    id: "2",
    studentId: "STU002",
    name: "Jane Smith",
    email: "jane.smith@university.edu",
    phone: "+1234567891",
    dateOfBirth: "2001-03-22",
    address: "456 Oak Ave, City, State 12345",
    enrollmentDate: "2023-09-01",
    status: "active",
  },
]


const courses: Course[] = [
  {
    id: "1",
    courseCode: "CS101",
    courseName: "Introduction to Programming",
    description: "Basic programming concepts and problem-solving",
    credits: 3,
    instructor: "Dr. Sarah Johnson",
    capacity: 30,
    schedule: "Mon/Wed 10:00-11:30",
    semester: "Fall 2024",
    status: "active",
  },
  {
    id: "2",
    courseCode: "MATH201",
    courseName: "Calculus II",
    description: "Advanced calculus topics including integration",
    credits: 4,
    instructor: "Prof. Michael Chen",
    capacity: 35,
    schedule: "Tue/Thu 14:00-15:30",
    semester: "Fall 2024",
    status: "active",
  },
]


const enrollments: Enrollment[] = [
  {
    id: "1",
    studentId: "1",
    courseId: "1",
    enrollmentDate: "2024-01-15",
    status: "active",
    grade: "A",
  },
  {
    id: "2",
    studentId: "2",
    courseId: "2",
    enrollmentDate: "2024-01-16",
    status: "active",
    grade: "A-",
  },
]


// Student operations
export const db = {
  students: {
    getAll: async () => students,
    getById: async (id: string) => students.find((s) => s.id === id),
    create: async (student: Omit<Student, "id">) => {
      const newStudent = { ...student, id: Date.now().toString() }
      students.push(newStudent)
      return newStudent
    },
    update: async (id: string, student: Partial<Student>) => {
      const index = students.findIndex((s) => s.id === id)
      if (index === -1) return null
      students[index] = { ...students[index], ...student }
      return students[index]
    },
    delete: async (id: string) => {
      const index = students.findIndex((s) => s.id === id)
      if (index === -1) return false
      students.splice(index, 1)
      return true
    },
  },
  courses: {
    getAll: async () => courses,
    getById: async (id: string) => courses.find((c) => c.id === id),
    create: async (course: Omit<Course, "id">) => {
      const newCourse = { ...course, id: Date.now().toString() }
      courses.push(newCourse)
      return newCourse
    },
    update: async (id: string, course: Partial<Course>) => {
      const index = courses.findIndex((c) => c.id === id)
      if (index === -1) return null
      courses[index] = { ...courses[index], ...course }
      return courses[index]
    },
    delete: async (id: string) => {
      const index = courses.findIndex((c) => c.id === id)
      if (index === -1) return false
      courses.splice(index, 1)
      return true
    },
  },
  enrollments: {
    getAll: async () => enrollments,
    getById: async (id: string) => enrollments.find((e) => e.id === id),
    getByStudentId: async (studentId: string) => enrollments.filter((e) => e.studentId === studentId),
    getByCourseId: async (courseId: string) => enrollments.filter((e) => e.courseId === courseId),
    create: async (enrollment: Omit<Enrollment, "id">) => {
      const newEnrollment = { ...enrollment, id: Date.now().toString() }
      enrollments.push(newEnrollment)
      return newEnrollment
    },
    update: async (id: string, enrollment: Partial<Enrollment>) => {
      const index = enrollments.findIndex((e) => e.id === id)
      if (index === -1) return null
      enrollments[index] = { ...enrollments[index], ...enrollment }
      return enrollments[index]
    },
    delete: async (id: string) => {
      const index = enrollments.findIndex((e) => e.id === id)
      if (index === -1) return false
      enrollments.splice(index, 1)
      return true
    },
  },
}
