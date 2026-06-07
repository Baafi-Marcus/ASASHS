import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { StudentList } from './StudentList';
import { StudentForm } from './StudentForm';
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

import { StudentBulkUpload } from './StudentBulkUpload';

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
          <div className="bg-school-green-700 px-6 py-4 rounded-t-2xl">
            <h2 className="text-xl font-bold text-white">Registration Successful!</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-school-cream-50 p-4 rounded-lg border border-school-cream-300">
              <h3 className="font-semibold text-gray-800 mb-3">Login Credentials</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Student ID:</label>
                  <div className="bg-white p-3 rounded border border-school-cream-300 font-mono font-bold text-school-green-700 mt-1">
                    {credentials.admissionNumber}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Password:</label>
                  <div className="bg-white p-3 rounded border border-school-cream-300 font-mono font-bold text-school-green-700 mt-1">
                    {credentials.password}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> The student must change this password on first login.
                Please share these credentials securely with the student.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Student ID: ${credentials.admissionNumber}\nPassword: ${credentials.password}`);
                  toast.success('Credentials copied to clipboard!');
                }}
                className="flex-1 bg-school-green-600 text-white py-3 px-4 rounded-lg hover:bg-school-green-700 transition-colors font-medium"
              >
                Copy Credentials
              </button>
              <button
                onClick={() => {
                  setCredentials(null);
                  setActiveTab('list');
                  window.location.reload();
                }}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderCredentialsModal()}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
          <p className="text-gray-600">Manage student registrations and view student information</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <PortalCard>
        <div className="bg-school-green-600 text-white rounded-lg overflow-hidden">
          <div className="flex">
            <PortalButton
              onClick={() => setActiveTab('list')}
              variant={activeTab === 'list' ? 'secondary' : 'primary'}
              className="flex-1 justify-center rounded-none"
            >
              <span>📋</span>
              <span className="ml-2 whitespace-nowrap">Student List</span>
            </PortalButton>
            <PortalButton
              onClick={() => setActiveTab('register')}
              variant={activeTab === 'register' ? 'secondary' : 'primary'}
              className="flex-1 justify-center rounded-none"
            >
              <span>➕</span>
              <span className="ml-2 whitespace-nowrap">Register Student</span>
            </PortalButton>
            <PortalButton
              onClick={() => setActiveTab('bulk')}
              variant={activeTab === 'bulk' ? 'secondary' : 'primary'}
              className="flex-1 justify-center rounded-none"
            >
              <span>📤</span>
              <span className="ml-2 whitespace-nowrap">Bulk Upload</span>
            </PortalButton>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'list' ? (
            <StudentList />
          ) : activeTab === 'register' ? (
            <StudentForm 
              onSuccess={handleStudentRegistered}
              programmes={courses}
              classes={classes}
            />
          ) : (
            <StudentBulkUpload 
              onSuccess={handleStudentRegistered}
              courses={courses}
              classes={classes}
            />
          )}
        </div>
      </PortalCard>
    </div>
  );
}