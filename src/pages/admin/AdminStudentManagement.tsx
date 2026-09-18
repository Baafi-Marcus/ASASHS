import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { StudentList } from './StudentList';
import { StudentForm } from './StudentForm';
import { StudentBulkUpload } from './StudentBulkUpload';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';

interface Course {
  id: number;
  name: string;
  code: string;
}

interface ClassItem {
  id: number;
  class_name: string;
  course_id: number;
  form: number;
  stream: string | null;
}

interface StudentCredentials {
  admissionNumber: string;
  password: string;
}

export function AdminStudentManagement() {
  const [activeTab, setActiveTab] = useState<'list' | 'register' | 'bulk'>('list');
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<StudentCredentials | null>(null);

  useEffect(() => {
    fetchCoursesAndClasses();
  }, []);

  const fetchCoursesAndClasses = async () => {
    setLoading(true);
    try {
      const [coursesData, classesData] = await Promise.all([
        db.getCourses(),
        db.getClasses()
      ]);
      
      setCourses(coursesData);
      setClasses(classesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load courses and classes');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegistered = (creds?: StudentCredentials) => {
    if (creds) {
      setCredentials(creds);
    } else {
      toast.success('Student(s) processed successfully!');
      setActiveTab('list');
      window.location.reload();
    }
  };

  // Credentials success modal
  const renderCredentialsModal = () => {
    if (!credentials) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-md border border-gray-200 shadow-xl max-w-md w-full mx-4 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-sm bg-school-green-50 border border-school-green-200 flex items-center justify-center text-school-green-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Registration Successful</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 p-4 rounded-sm border border-gray-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">Login Credentials</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Student ID / Index No:</label>
                  <div className="bg-white px-3 py-2 rounded-sm border border-gray-300 font-mono font-bold text-gray-900 text-sm mt-1 tabular-nums">
                    {credentials.admissionNumber}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Temporary Password:</label>
                  <div className="bg-white px-3 py-2 rounded-sm border border-gray-300 font-mono font-bold text-school-green-700 text-sm mt-1">
                    {credentials.password}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 p-3 rounded-sm border border-amber-200 text-xs text-amber-800 leading-relaxed">
              <strong>Security Note:</strong> The student must change this temporary password upon their first login. Please share these credentials securely.
            </div>
            <div className="flex gap-3 pt-2">
              <PortalButton
                onClick={() => {
                  navigator.clipboard.writeText(`Student ID: ${credentials.admissionNumber}\nPassword: ${credentials.password}`);
                  toast.success('Credentials copied to clipboard');
                }}
                variant="primary"
                className="flex-1 justify-center"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Credentials
              </PortalButton>
              <PortalButton
                onClick={() => {
                  setCredentials(null);
                  setActiveTab('list');
                  window.location.reload();
                }}
                variant="secondary"
                className="flex-1 justify-center"
              >
                Close
              </PortalButton>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderCredentialsModal()}
      
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Student Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage student admissions, directory roster, and portal credentials</p>
        </div>
        
        {/* Clean Segmented Navigation */}
        <div className="inline-flex p-1 bg-gray-100 border border-gray-200 rounded-md">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-medium transition-all ${
              activeTab === 'list'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Student Roster
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-medium transition-all ${
              activeTab === 'register'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register Student
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-medium transition-all ${
              activeTab === 'bulk'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Bulk CSV Upload
          </button>
        </div>
      </div>

      {/* Main Tab Workspace */}
      {activeTab === 'list' ? (
        <StudentList />
      ) : activeTab === 'register' ? (
        <PortalCard title="Register New Student" subtitle="Create student account credentials and class assignment">
          <StudentForm 
            onSuccess={handleStudentRegistered}
            programmes={courses}
            classes={classes}
          />
        </PortalCard>
      ) : (
        <StudentBulkUpload 
          onSuccess={handleStudentRegistered}
          courses={courses}
          classes={classes}
        />
      )}
    </div>
  );
}