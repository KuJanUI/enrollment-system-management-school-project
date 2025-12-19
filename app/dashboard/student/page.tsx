"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

export default function StudentDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      // Fetch available courses
      const coursesRes = await fetch('/api/courses', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      const coursesData = await coursesRes.json()
      if (coursesData.success) {
        setCourses(coursesData.courses)
      }

      // Fetch student enrollments
      const enrollmentsRes = await fetch('/api/enrollments', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      const enrollmentsData = await enrollmentsRes.json()
      if (enrollmentsData.success) {
        setEnrollments(enrollmentsData.enrollments)
      }
    } catch (error) {
      alert('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: number) => {
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Enrolled successfully!')
        fetchData() // Refresh data
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Failed to enroll')
    }
  }

  const handleDrop = async (enrollmentId: number) => {
    try {
      const response = await fetch(`/api/enrollments?enrollmentId=${enrollmentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()
      if (data.success) {
        alert('Dropped successfully!')
        fetchData() // Refresh data
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Failed to drop enrollment')
    }
  }

}
