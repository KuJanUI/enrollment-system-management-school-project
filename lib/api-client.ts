const API_BASE = "/api"

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const apiClient = {
  async getStudents() {
    const response = await fetch(`${API_BASE}/students`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    if (!data.success) {
      if (response.status === 403) return []
      throw new Error(data.message || "Failed to fetch students")
    }
    return data.students || []
  },

  async createStudent(student: any) {
    const response = await fetch(`${API_BASE}/students`, {
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to create student")
    return data
  },

  async updateStudent(studentId: number, updateData: any) {
    const response = await fetch(`${API_BASE}/students`, {
      method: "PUT",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, ...updateData }),
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to update student")
    return data
  },

  async deleteStudent(studentId: number) {
    const response = await fetch(`${API_BASE}/students?id=${studentId}`, {
      method: "DELETE",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to delete student")
    return data
  },

  async getCourses() {
    const response = await fetch(`${API_BASE}/courses`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to fetch courses")
    
    // API now returns data in the correct format, no transformation needed
    const courses = data.courses || []
    
    return courses
  },

  async createCourse(course: any) {
    const courseData = {
      code: course.courseCode,
      name: course.courseName,
      description: course.description,
      credits: course.credits,
      instructor: course.instructor,
      maxCapacity: course.capacity,
      schedule: course.schedule,
      semester: course.semester,
    }
    
    const response = await fetch(`${API_BASE}/courses`, {
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courseData),
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to create course")
    return data
  },

  async updateCourse(courseId: number, updateData: any) {
    const courseData = {
      courseId,
      code: updateData.courseCode,
      name: updateData.courseName,
      description: updateData.description,
      credits: updateData.credits,
      instructor: updateData.instructor,
      maxCapacity: updateData.capacity,
      schedule: updateData.schedule,
      semester: updateData.semester,
      status: updateData.status,
    }
    
    const response = await fetch(`${API_BASE}/courses`, {
      method: "PUT",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courseData),
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to update course")
    return data
  },

  async deleteCourse(courseId: number) {
    const response = await fetch(`${API_BASE}/courses?courseId=${courseId}`, {
      method: "DELETE",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to delete course")
    return data
  },

  async getEnrollments() {
    const response = await fetch(`${API_BASE}/enrollments`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to fetch enrollments")
    return data.enrollments || []
  },

  async createEnrollment(enrollment: any) {
    const response = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enrollment),
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to create enrollment")
    return data
  },

  async updateEnrollment(enrollmentId: number, updateData: any) {
    const response = await fetch(`${API_BASE}/enrollments`, {
      method: "PUT",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentId, ...updateData }),
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to update enrollment")
    return data
  },

  async deleteEnrollment(enrollmentId: number) {
    const response = await fetch(`${API_BASE}/enrollments?enrollmentId=${enrollmentId}`, {
      method: "DELETE",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to delete enrollment")
    return data
  },

  async getStats() {
    const response = await fetch(`${API_BASE}/stats`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to fetch stats")
    return data.stats
  },
}
