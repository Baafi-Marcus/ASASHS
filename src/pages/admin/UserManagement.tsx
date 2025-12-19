import React, { useState, useEffect } from "react";
import { db } from "../../../lib/neon";
import toast from "react-hot-toast";

interface Student {
  id: number;
  admission_number: string;
  surname: string;
  other_names: string;
  gender: string;
  programme_id: number;
  current_class_id: number;
  created_at: string;
  course_name?: string;
  class_name?: string;
  is_active: boolean;
}

interface Teacher {
  id: number;
  staff_id: string;
  title: string;
  surname: string;
  other_names: string;
  gender: string;
  department: string;
  position_rank: string;
  status: string;
  created_at: string;
  is_active: boolean;
}

interface BulkAction {
  id: string;
  action: string;
  targetType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export function UserManagement() {
  const [activeTab, setActiveTab] = useState("bulk-operations");
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [bulkActions, setBulkActions] = useState<BulkAction[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkActionType, setBulkActionType] = useState("deactivate");
  const [targetType, setTargetType] = useState("students");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch students and teachers for selection, including inactive users
      const [studentsData, teachersData] = await Promise.all([
        db.getStudents({ limit: 100, includeInactive: true }),
        db.getTeachers({ limit: 100, includeInactive: true }),
      ]);

      setStudents(studentsData as Student[]);
      setTeachers(teachersData as Teacher[]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAllStudents = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleSelectAllTeachers = (checked: boolean) => {
    if (checked) {
      setSelectedTeachers(teachers.map(t => t.id));
    } else {
      setSelectedTeachers([]);
    }
  };

  const handleSelectTeacher = (teacherId: number, checked: boolean) => {
    if (checked) {
      setSelectedTeachers([...selectedTeachers, teacherId]);
    } else {
      setSelectedTeachers(selectedTeachers.filter(id => id !== teacherId));
    }
  };

  const executeBulkAction = async () => {
    if ((targetType === "students" && selectedStudents.length === 0) || 
        (targetType === "teachers" && selectedTeachers.length === 0)) {
      toast.error("Please select at least one user");
      return;
    }

    const actionId = Date.now().toString();
    const newAction: BulkAction = {
      id: actionId,
      action: bulkActionType,
      targetType,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setBulkActions([newAction, ...bulkActions]);

    try {
      // Update status to processing
      setBulkActions(bulkActions.map(a => 
        a.id === actionId ? {...a, status: 'processing'} : a
      ));

      // Simulate bulk operation (in a real app, this would call API endpoints)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update status to completed
      setBulkActions(bulkActions.map(a => 
        a.id === actionId ? {...a, status: 'completed', completedAt: new Date().toISOString()} : a
      ));

      toast.success(`Bulk ${bulkActionType} operation completed successfully`);
      
      // Clear selections
      if (targetType === "students") {
        setSelectedStudents([]);
      } else {
        setSelectedTeachers([]);
      }
    } catch (error) {
      console.error("Bulk operation failed:", error);
      setBulkActions(bulkActions.map(a => 
        a.id === actionId ? {...a, status: 'failed'} : a
      ));
      toast.error("Bulk operation failed");
    }
  };

  const renderBulkOperations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Bulk User Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={bulkActionType}
              onChange={(e) => setBulkActionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
            >
              <option value="deactivate">Deactivate</option>
              <option value="activate">Activate</option>
              <option value="reset-password">Reset Password</option>
              <option value="export">Export Data</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
            >
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={executeBulkAction}
              disabled={(targetType === "students" && selectedStudents.length === 0) || 
                       (targetType === "teachers" && selectedTeachers.length === 0)}
              className="w-full bg-school-green-600 text-white px-4 py-2 rounded-lg hover:bg-school-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Execute Action
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">
            Selected {targetType}: {
              targetType === "students" ? selectedStudents.length : selectedTeachers.length
            } of {
              targetType === "students" ? students.length : teachers.length
            }
          </h4>
        </div>
        
        {targetType === "students" ? (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-school-cream-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === students.length && students.length > 0}
                      onChange={(e) => handleSelectAllStudents(e.target.checked)}
                      className="rounded text-school-green-600 focus:ring-school-green-500"
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">Course</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-school-cream-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                        className="rounded text-school-green-600 focus:ring-school-green-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {student.surname}, {student.other_names}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {student.admission_number}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {student.course_name || "Not assigned"}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.is_active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {student.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-school-cream-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTeachers.length === teachers.length && teachers.length > 0}
                      onChange={(e) => handleSelectAllTeachers(e.target.checked)}
                      className="rounded text-school-green-600 focus:ring-school-green-500"
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">Department</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-school-cream-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher.id)}
                        onChange={(e) => handleSelectTeacher(teacher.id, e.target.checked)}
                        className="rounded text-school-green-600 focus:ring-school-green-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {teacher.title} {teacher.surname}, {teacher.other_names}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {teacher.staff_id}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {teacher.department}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        teacher.is_active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {teacher.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderBulkActionsHistory = () => (
    <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Bulk Actions History</h3>
      
      {bulkActions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500">No bulk actions executed yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-school-cream-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">Action</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">Target</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">Created</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 uppercase">Completed</th>
              </tr>
            </thead>
            <tbody>
              {bulkActions.map((action) => (
                <tr key={action.id} className="hover:bg-school-cream-50">
                  <td className="px-4 py-2 text-sm capitalize">{action.action.replace('-', ' ')}</td>
                  <td className="px-4 py-2 text-sm capitalize">{action.targetType}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      action.status === 'completed' ? 'bg-green-100 text-green-800' :
                      action.status === 'failed' ? 'bg-red-100 text-red-800' :
                      action.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {action.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(action.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {action.completedAt ? new Date(action.completedAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Bulk User Operations</h2>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl border-2 border-school-cream-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("bulk-operations")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "bulk-operations"
                  ? "border-school-green-600 text-school-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Bulk Operations
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-school-green-600 text-school-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Action History
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === "bulk-operations" && renderBulkOperations()}
          {activeTab === "history" && renderBulkActionsHistory()}
        </div>
      </div>
    </div>
  );
}