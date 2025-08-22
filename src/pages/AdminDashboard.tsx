// src/pages/AdminDashboard.tsx
import React, { useState } from "react"
import { UserManagement } from "./admin/UserManagement"
import { CourseManagement } from "./admin/CourseManagement"
import { SystemOversight } from "./admin/SystemOversight"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Monitor,
  LogOut,
} from "lucide-react"
import { Button } from "../components/ui/button"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "courses" | "system">(
    "users"
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("users")}
          >
            <Users className="h-4 w-4 mr-2" />
            User Management
          </Button>
          <Button
            variant={activeTab === "courses" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("courses")}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Course Management
          </Button>
          <Button
            variant={activeTab === "system" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("system")}
          >
            <Monitor className="h-4 w-4 mr-2" />
            System Oversight
          </Button>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Button variant="destructive" className="w-full justify-start">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "courses" && <CourseManagement />}
        {activeTab === "system" && <SystemOversight />}
      </main>
    </div>
  )
}
