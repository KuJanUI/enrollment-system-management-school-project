"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const coursesRes = await fetch("/api/courses")
      const coursesData = await coursesRes.json()
      if (coursesData.success) {
        setCourses(coursesData.courses)
      }

      // Fetch all students
      const studentsRes = await fetch('/api/students', {
        credentials: 'include',
      })
      const studentsData = await studentsRes.json()
      if (studentsData.success) {
        setStudents(studentsData.students)
      }

      // Fetch all enrollments
      const enrollmentsRes = await fetch('/api/enrollments', {
        credentials: 'include',
      })
      const enrollmentsData = await enrollmentsRes.json()
      if (enrollmentsData.success) {
        setEnrollments(enrollmentsData.enrollments)
      }
    } catch (error) {
      alert("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      setIsAuthorized(false)
      setLoading(false)
      router.replace("/login")
      return
    }

    if (user.role !== "admin") {
      setIsAuthorized(false)
      setLoading(false)
      router.replace("/dashboard/student")
      return
    }

    setIsAuthorized(true)
    setLoading(true)
    fetchData()
  }, [authLoading, fetchData, router, user])

  const handleCreateCourse = async (courseData: any) => {
    if (!isAuthorized) {
      alert("Unauthorized")
      return
    }
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      })

      const data = await response.json()
      if (data.success) {
        alert("Course created successfully!")
        fetchData() // Refresh data
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert("Failed to create course")
    }
  }

  const handleUpdateCourse = async (courseId: number, updateData: any) => {
    if (!isAuthorized) {
      alert("Unauthorized")
      return
    }
    try {
      const response = await fetch("/api/courses", {
        method: "PUT",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, ...updateData }),
      })

      const data = await response.json()
      if (data.success) {
        alert("Course updated successfully!")
        fetchData() // Refresh data
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert("Failed to update course")
    }
  }

  if (!isAuthorized) {
    return null
  }
}
