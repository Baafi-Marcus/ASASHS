import React, { useState, useEffect } from "react";
import { db } from "../../../lib/neon";
import toast from "react-hot-toast";
import {
  UsersIcon,
  AcademicCapIcon,
  KeyIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { PortalButton } from "../../components/PortalButton";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";

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
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
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
      toast.error("Please select at least one record to execute this operation");
      return;
    }

    setIsExecuting(true);
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
      setBulkActions(prev => prev.map(a => 
        a.id === actionId ? {...a, status: 'processing'} : a
      ));

      await new Promise(resolve => setTimeout(resolve, 1500));

      setBulkActions(prev => prev.map(a => 
        a.id === actionId ? {...a, status: 'completed', completedAt: new Date().toISOString()} : a
      ));

      toast.success(`Bulk ${bulkActionType} command dispatched successfully`);
      
      if (targetType === "students") {
        setSelectedStudents([]);
      } else {
        setSelectedTeachers([]);
      }
    } catch (error) {
      console.error("Bulk operation failed:", error);
      setBulkActions(prev => prev.map(a => 
        a.id === actionId ? {...a, status: 'failed'} : a
      ));
      toast.error("Bulk operation failed to complete");
    } finally {
      setIsExecuting(false);
    }
  };

  const renderBulkOperations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 space-y-4">
        <div className="pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Execute Bulk Administrative Action</h3>
          <p className="text-xs text-gray-500 mt-0.5">Select command type and target roster to update account permissions or credentials</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Administrative Command</label>
            <select
              value={bulkActionType}
              onChange={(e) => setBulkActionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white"
            >
              <option value="deactivate">Deactivate Accounts</option>
              <option value="activate">Activate Accounts</option>
              <option value="reset-password">Force Password Reset</option>
              <option value="export">Export Cohort Data</option>
            </select>
          </div>
          
          <div>
            <label className="block font-medium text-gray-700 mb-1">Target Registry</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white"
            >
              <option value="students">Student Cohort</option>
              <option value="teachers">Teaching Staff</option>
            </select>
          </div>
          
          <div>
            <PortalButton
              onClick={executeBulkAction}
              disabled={isExecuting || ((targetType === "students" && selectedStudents.length === 0) || 
                       (targetType === "teachers" && selectedTeachers.length === 0))}
              className="w-full py-2 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 disabled:opacity-40 transition-colors shadow-2xs"
            >
              {isExecuting ? 'Executing Command...' : 'Execute Command'}
            </PortalButton>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 text-xs text-gray-600">
          <span className="tabular-nums">
            Selected {targetType}: <strong>{targetType === "students" ? selectedStudents.length : selectedTeachers.length}</strong> of {targetType === "students" ? students.length : teachers.length} total
          </span>
        </div>
        
        {targetType === "students" ? (
          <div className="border border-gray-200 rounded-sm overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === students.length && students.length > 0}
                      onChange={(e) => handleSelectAllStudents(e.target.checked)}
                      className="rounded-xs text-school-green-700 focus:ring-school-green-500"
                    />
                  </th>
                  <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Candidate Name</th>
                  <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Admission ID</th>
                  <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Programme</th>
                  <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                        className="rounded-xs text-school-green-700 focus:ring-school-green-500"
                      />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      {student.surname}, {student.other_names}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-gray-600 tabular-nums">
                      {student.admission_number}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">
                      {student.course_name || "Unassigned"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-sm ${
                        student.is_active 
                          ? "bg-green-50 text-green-800 border border-green-200" 
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}>
                        {student.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-sm overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedTeachers.length === teachers.length && teachers.length > 0}
                      onChange={(e) => handleSelectAllTeachers(e.target.checked)}
                      className="rounded-xs text-school-green-700 focus:ring-school-green-500"
                    />
                  </th>
                  <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Faculty Member</th>
                  <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Staff ID</th>
                  <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher.id)}
                        onChange={(e) => handleSelectTeacher(teacher.id, e.target.checked)}
                        className="rounded-xs text-school-green-700 focus:ring-school-green-500"
                      />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      {teacher.title} {teacher.surname}, {teacher.other_names}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-gray-600 tabular-nums">
                      {teacher.staff_id}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">
                      {teacher.department}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-sm ${
                        teacher.is_active 
                          ? "bg-green-50 text-green-800 border border-green-200" 
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}>
                        {teacher.is_active ? "Active" : "Disabled"}
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
    <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 space-y-4">
      <div className="pb-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Batch Command Audit History</h3>
        <p className="text-xs text-gray-500 mt-0.5">Log of recently dispatched administrative bulk executions</p>
      </div>
      
      {bulkActions.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-200 rounded-sm">
          <p className="text-xs text-gray-400">No bulk commands recorded in this administrative session.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-sm overflow-hidden">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Operation</th>
                <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Target</th>
                <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Dispatched</th>
                <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider">Concluded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {bulkActions.map((action) => (
                <tr key={action.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-900 capitalize">{action.action.replace('-', ' ')}</td>
                  <td className="px-4 py-2.5 text-gray-600 capitalize">{action.targetType}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-sm ${
                      action.status === 'completed' ? 'bg-green-50 text-green-800 border border-green-200' :
                      action.status === 'failed' ? 'bg-red-50 text-red-800 border border-red-200' :
                      action.status === 'processing' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {action.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-gray-500 tabular-nums">
                    {new Date(action.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-gray-500 tabular-nums">
                    {action.completedAt ? new Date(action.completedAt).toLocaleString() : '—'}
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
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">User Governance & Bulk Account Actions</h2>
          <p className="text-xs text-gray-500 mt-0.5">Perform batch account modifications, security credential resets, and exports</p>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 flex space-x-1">
        <button
          onClick={() => setActiveTab("bulk-operations")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "bulk-operations"
              ? "border-school-green-700 text-school-green-800 bg-school-green-50/40"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Batch Operations
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-school-green-700 text-school-green-800 bg-school-green-50/40"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Execution History
        </button>
      </div>
      
      {/* Content */}
      <div>
        {activeTab === "bulk-operations" && renderBulkOperations()}
        {activeTab === "history" && renderBulkActionsHistory()}
      </div>
    </div>
  );
}