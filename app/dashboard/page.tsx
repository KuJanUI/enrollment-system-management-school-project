"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportsSection } from "@/components/reports-section"
import { Users, BookOpen, ClipboardList, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import type { Student, Course, Enrollment } from "@/lib/types"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

type Stats = {
  totalStudents: number
  totalCourses: number
  totalEnrollments: number
  activeEnrollments: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
  })

  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Fetch data based on user role
      const coursesData = await apiClient.getCourses()
      const enrollmentsData = await apiClient.getEnrollments()
      
      // Only admins can fetch all students
      let studentsData: Student[] = []
      if (user?.role === 'admin') {
        studentsData = await apiClient.getStudents()
      }

      setStudents(studentsData)
      setCourses(coursesData)
      setEnrollments(enrollmentsData)

      setStats({
        totalStudents: studentsData.length,
        totalCourses: coursesData.length,
        totalEnrollments: enrollmentsData.length,
        activeEnrollments: enrollmentsData.filter((e: any) => e.status === "active").length,
      })
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
    },
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300",
    },
    {
      title: "Total Enrollments",
      value: stats.totalEnrollments,
      icon: ClipboardList,
      color: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300",
    },
    {
      title: "Active Enrollments",
      value: stats.activeEnrollments,
      icon: TrendingUp,
      color: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your enrollment system.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.totalEnrollments === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        System is active with {stats.activeEnrollments} ongoing enrollments
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Enrollment Rate</span>
                      <span className="text-sm font-medium">
                        {stats.totalCourses > 0
                          ? `${Math.round((stats.totalEnrollments / (stats.totalCourses * 30)) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg. Students per Course</span>
                      <span className="text-sm font-medium">
                        {stats.totalCourses > 0 ? Math.round(stats.totalEnrollments / stats.totalCourses) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">System Status</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <ReportsSection students={students} courses={courses} enrollments={enrollments} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
