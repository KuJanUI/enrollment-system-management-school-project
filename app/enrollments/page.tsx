"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import type { Enrollment, Student, Course } from "@/lib/types"
import { toast } from "sonner"
import { TablePagination } from "@/components/table-pagination"

export default function EnrollmentsPage() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
    status: "active" as "active" | "completed" | "dropped",
    grade: "",
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const enrollmentsData = await apiClient.getEnrollments()
      const coursesData = await apiClient.getCourses()
      
      let studentsData: Student[] = []
      if (user?.role === 'admin') {
        studentsData = await apiClient.getStudents()
      }
      
      setEnrollments(enrollmentsData)
      setStudents(studentsData)
      setCourses(coursesData)
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingEnrollment) {
        await apiClient.updateEnrollment(Number(editingEnrollment.id), formData)
        toast.success("Enrollment updated successfully")
      } else {
        const enrollmentData = {
          ...formData,
          enrollmentDate: new Date().toISOString().split("T")[0],
        }
        await apiClient.createEnrollment(enrollmentData)
        toast.success("Enrollment created successfully")
      }
      await loadData()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save enrollment")
    }
  }

  const handleEdit = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment)
    setFormData({
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      status: enrollment.status,
      grade: enrollment.grade || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!enrollmentToDelete) return

    try {
      await apiClient.deleteEnrollment(Number(enrollmentToDelete))
      toast.success("Enrollment deleted successfully")
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete enrollment")
    }
    
    setDeleteDialogOpen(false)
    setEnrollmentToDelete(null)
  }

  const openDeleteDialog = (id: string) => {
    setEnrollmentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      studentId: "",
      courseId: "",
      status: "active",
      grade: "",
    })
    setEditingEnrollment(null)
  }

  const getStudentName = (enrollment: Enrollment) => {
    if (enrollment.studentName) {
      return enrollment.studentName
    }
    const student = students.find((s) => s.id === enrollment.studentId)
    return student ? student.name : "Unknown"
  }

  const getCourseName = (enrollment: Enrollment) => {
    if (enrollment.courseCode && enrollment.courseName) {
      return `${enrollment.courseCode} - ${enrollment.courseName}`
    }
    const course = courses.find((c) => c.id === enrollment.courseId)
    return course ? `${course.courseCode} - ${course.courseName}` : "Unknown"
  }

  const getInstructorName = (enrollment: Enrollment) => {
    const name =
      enrollment.instructorName ||
      courses.find((c) => c.id === enrollment.courseId)?.instructor ||
      ""

    return name?.trim() || "Unknown"
  }

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const query = searchQuery.toLowerCase()

    const studentName = getStudentName(enrollment).toLowerCase()
    const courseName = getCourseName(enrollment).toLowerCase()
    const instructorName = getInstructorName(enrollment).toLowerCase()

    return (
      studentName.includes(query) ||
      courseName.includes(query) ||
      instructorName.includes(query)
    )
  })
  const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEnrollments = filteredEnrollments.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Enrollment Management</h1>
            <p className="text-muted-foreground">Manage student course enrollments</p>
          </div>
          {user?.role === "admin" && (
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Enrollment
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingEnrollment ? "Edit Enrollment" : "Add New Enrollment"}</DialogTitle>
                <DialogDescription>
                  {editingEnrollment ? "Update enrollment information" : "Enroll a student in a course"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student</Label>
                  <Select
                    value={formData.studentId}
                    onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.studentId} - {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseId">Course</Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.courseCode} - {course.courseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "completed" | "dropped") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade (Optional)</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="A, B+, C, etc."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingEnrollment ? "Update" : "Add"} Enrollment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search enrollments by student or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No enrollments found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {students.length === 0 || courses.length === 0
                    ? "Add students and courses first"
                    : "Add your first enrollment to get started"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>instructor</TableHead>
                        <TableHead>Enrollment Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Grade</TableHead>
                        {user?.role === "admin" && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">{getStudentName(enrollment)}</TableCell>
                          <TableCell>{getCourseName(enrollment)}</TableCell>
                          <TableCell>{getInstructorName(enrollment)}</TableCell>
                          <TableCell>{enrollment.enrollmentDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                enrollment.status === "active"
                                  ? "default"
                                  : enrollment.status === "completed"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {enrollment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{enrollment.grade || "-"}</TableCell>
                          {user?.role === "admin" && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(enrollment)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(enrollment.id)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredEnrollments.length}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this enrollment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
