"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Student, Course, Enrollment } from "@/lib/types"

type ReportsSectionProps = {
  students: Student[]
  courses: Course[]
  enrollments: Enrollment[]
}

export function ReportsSection({ students, courses, enrollments }: ReportsSectionProps) {
  // Calculate enrollment statistics per course
  const courseEnrollmentStats = courses.map((course) => {
    const courseEnrollments = enrollments.filter((e) => e.courseId === course.id)
    const activeEnrollments = courseEnrollments.filter((e) => e.status === "active").length
    const completedEnrollments = courseEnrollments.filter((e) => e.status === "completed").length

    return {
      courseCode: course.courseCode,
      courseName: course.courseName,
      capacity: course.capacity,
      enrolled: courseEnrollments.length,
      active: activeEnrollments,
      completed: completedEnrollments,
      utilizationRate: Math.round((courseEnrollments.length / course.capacity) * 100),
    }
  })

  // Calculate student enrollment statistics
  const studentEnrollmentStats = students.map((student) => {
    const studentEnrollments = enrollments.filter((e) => e.studentId === student.id)
    const activeEnrollments = studentEnrollments.filter((e) => e.status === "active").length
    const completedEnrollments = studentEnrollments.filter((e) => e.status === "completed").length

    return {
      studentId: student.studentId,
      name: student.name,
      totalEnrollments: studentEnrollments.length,
      active: activeEnrollments,
      completed: completedEnrollments,
      status: student.status,
    }
  })

  // Calculate overall statistics
  const totalActiveEnrollments = enrollments.filter((e) => e.status === "active").length
  const totalCompletedEnrollments = enrollments.filter((e) => e.status === "completed").length
  const totalDroppedEnrollments = enrollments.filter((e) => e.status === "dropped").length
  const averageEnrollmentsPerStudent = students.length > 0 ? (enrollments.length / students.length).toFixed(1) : "0"
  const averageEnrollmentsPerCourse = courses.length > 0 ? (enrollments.length / courses.length).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletedEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. per Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEnrollmentsPerStudent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. per Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEnrollmentsPerCourse}</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Enrollment Report */}
      <Card>
        <CardHeader>
          <CardTitle>Course Enrollment Report</CardTitle>
        </CardHeader>
        <CardContent>
          {courseEnrollmentStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No course data available</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Utilization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseEnrollmentStats.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stat.courseCode}</TableCell>
                      <TableCell>{stat.courseName}</TableCell>
                      <TableCell>{stat.capacity}</TableCell>
                      <TableCell>{stat.enrolled}</TableCell>
                      <TableCell>{stat.active}</TableCell>
                      <TableCell>{stat.completed}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={stat.utilizationRate} className="w-[100px]" />
                          <span className="text-sm font-medium min-w-[45px]">{stat.utilizationRate}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Enrollment Report */}
      <Card>
        <CardHeader>
          <CardTitle>Student Enrollment Report</CardTitle>
        </CardHeader>
        <CardContent>
          {studentEnrollmentStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No student data available</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Total Enrollments</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentEnrollmentStats.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stat.studentId}</TableCell>
                      <TableCell>{stat.name}</TableCell>
                      <TableCell>{stat.totalEnrollments}</TableCell>
                      <TableCell>{stat.active}</TableCell>
                      <TableCell>{stat.completed}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            stat.status === "active" ? "default" : stat.status === "graduated" ? "secondary" : "outline"
                          }
                        >
                          {stat.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrollment Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="default">Active</Badge>
              </div>
              <span className="text-sm font-bold">{totalActiveEnrollments}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Completed</Badge>
              </div>
              <span className="text-sm font-bold">{totalCompletedEnrollments}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline">Dropped</Badge>
              </div>
              <span className="text-sm font-bold">{totalDroppedEnrollments}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
