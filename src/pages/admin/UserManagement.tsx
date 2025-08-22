// src/pages/UserManagement.tsx
import React, { useState } from "react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { MoreHorizontal } from "lucide-react"

// Dummy data (replace with Supabase queries)
const dummyStudents = [
  { id: 1, name: "John Doe", email: "john@school.com", class: "Form 2A", status: "Active" },
  { id: 2, name: "Mary Jane", email: "mary@school.com", class: "Form 3B", status: "Active" },
]

const dummyTeachers = [
  { id: 1, name: "Mr. Smith", email: "smith@school.com", subject: "Math", status: "Active" },
  { id: 2, name: "Mrs. Brown", email: "brown@school.com", subject: "Science", status: "Disabled" },
]

export function UserManagement() {
  const [openDialog, setOpenDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("students")

  const renderTable = (data: any[], type: string) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          {type === "students" && <TableHead>Class</TableHead>}
          {type === "teachers" && <TableHead>Subject</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.email}</TableCell>
            {type === "students" && <TableCell>{item.class}</TableCell>}
            {type === "teachers" && <TableCell>{item.subject}</TableCell>}
            <TableCell>{item.status}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage students and teachers</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
          </TabsList>

          <div className="flex justify-end mt-4">
            <Button onClick={() => setOpenDialog(true)}>
              Register New {activeTab === "students" ? "Student" : "Teacher"}
            </Button>
          </div>

          <TabsContent value="students" className="mt-6">
            {renderTable(dummyStudents, "students")}
          </TabsContent>
          <TabsContent value="teachers" className="mt-6">
            {renderTable(dummyTeachers, "teachers")}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Registration Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Register New {activeTab === "students" ? "Student" : "Teacher"}
            </DialogTitle>
          </DialogHeader>
          {/* 🔥 Swap this with StudentForm / TeacherForm */}
          <p className="text-gray-600">Form for {activeTab} goes here...</p>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
