"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GraduationCap, Users, BookOpen, BarChart } from "lucide-react"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-primary text-primary-foreground p-4 rounded-2xl">
              <GraduationCap className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-balance">Enrollment Management System</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Streamline student enrollment, course management, and academic administration all in one place
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                Register
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border">
            <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Student Management</h3>
            <p className="text-muted-foreground">
              Efficiently manage student records, profiles, and academic information
            </p>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border">
            <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Course Management</h3>
            <p className="text-muted-foreground">Create and manage courses, schedules, and enrollment capacity</p>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border">
            <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-muted-foreground">Track enrollment trends and generate comprehensive reports</p>
          </div>
        </div>
      </div>
    </div>
  )
}
