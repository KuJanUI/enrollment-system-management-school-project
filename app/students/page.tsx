"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TablePagination } from "@/components/table-pagination"
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
import type { Student } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function StudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    status: "active" as "active" | "inactive" | "graduated",
  })
 useEffect(() => {
    if (!user) return
    fetchStudents()
  }, [user])

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/students?userRole=${user?.role}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()

      if (data.success) {
        setStudents(data.students)
      } else {
        toast.error("Failed to fetch students")
      }
    } catch (err) {
      toast.error("API error occurred while fetching students")
    }
  }

  // ==========================
  // 🔵 Add / Update student
  // ==========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingStudent) {
      // Update using API
      await updateStudent(editingStudent.id)
    } else {
      // Add using API
      await createStudent()
    }

    resetForm()
    setIsDialogOpen(false)
    await fetchStudents() // refresh list
  }

  // Create new student — requires POST API (you must implement it)
  const createStudent = async () => {
    const response = await fetch("/api/students", {
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, userRole: user?.role }),
    })

    const data = await response.json()
    if (data.success) {
      toast.success(data.message || "Student created successfully")
    } else {
      toast.error(data.message || "Failed to create student")
    }
  }

  // Update existing student through your PUT API
  const updateStudent = async (id: string) => {
    const { studentId: _omitStudentId, ...formPayload } = formData
    const { password, ...restPayload } = formPayload
    const payload = {
      ...restPayload,
      ...(password ? { password } : {}),
    }

    const response = await fetch("/api/students", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        studentId: id,
        userRole: user?.role,
        userId: user?.id,
      }),
    })

    const data = await response.json()
    if (data.success) {
      toast.success("Student updated successfully")
    } else {
      toast.error(data.message || "Failed to update student")
    }
  }

  // ==========================
  // 🔴 Delete (you need DELETE API)
  // ==========================
  const handleDelete = async () => {
    if (!studentToDelete) return

    const response = await fetch(`/api/students?id=${studentToDelete}&userRole=${user?.role}`, {
      method: "DELETE",
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()

    if (data.success) {
      toast.success("Student deleted successfully")
      fetchStudents()
    } else {
      toast.error(data.message || "Failed to delete student")
    }
    
    setDeleteDialogOpen(false)
    setStudentToDelete(null)
  }

  const openDeleteDialog = (id: string) => {
    setStudentToDelete(id)
    setDeleteDialogOpen(true)
  }

  // UI Helper Functions
  const resetForm = () => {
    setFormData({
      studentId: "",
      name: "",
      email: "",
      password: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      status: "active",
    })
    setEditingStudent(null)
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      studentId: student.studentId,
      name: student.name ?? "",
      email: student.email ?? "",
      password: "",
      phone: student.phone ?? "",
      dateOfBirth: student.dateOfBirth ?? "",
      address: student.address ?? "",
      status: student.status,
    })
    setIsDialogOpen(true)
  }

  // ==========================
  // 🔍 Search Filter
  // ==========================
  const filteredStudents = students.filter((student) => {
    const fullName = student.name?.toLowerCase() || ""
    const email = student.email?.toLowerCase() || ""

    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase())
    )
  })

  // ==========================
  // 📄 Pagination Logic
  // ==========================
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage)

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // ==========================
  // 🔵 Render UI
  // ==========================

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Student Management</h1>
            <p className="text-muted-foreground">Manage student records and information</p>
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
                  Add Student
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
                <DialogDescription>
                  {editingStudent ? "Update student information" : "Enter student details to add to the system"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      placeholder="STU001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ku Jan"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@student.edu.kh"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      required={!editingStudent}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive" | "graduated") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="graduated">Graduated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St, City, Country"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingStudent ? "Update" : "Add"} Student</Button>
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
                  placeholder="Search students by name, ID, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No students found</p>
                <p className="text-sm text-muted-foreground mt-1">Add your first student to get started</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Enrollment Date</TableHead>
                        {user?.role === "admin" && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.studentId}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.status === "active"
                                  ? "default"
                                  : student.status === "graduated"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{student.enrollmentDate}</TableCell>
                          {user?.role === "admin" && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(student)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(student.id)}>
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
                  totalItems={filteredStudents.length}
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
              This will permanently delete this student and all associated data. This action cannot be undone.
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
