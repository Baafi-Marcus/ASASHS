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
  form: number;
  stream: string | null;
}

export function AdminStudentManagement() {
  const [activeTab, setActiveTab] = useState<'list' | 'register'>('list');
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleStudentRegistered = () => {
    toast.success('Student registered successfully!');
    setActiveTab('list');
    // Refresh the student list
    window.location.reload();
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
              <span className="ml-2">Student List</span>
            </PortalButton>
            <PortalButton
              onClick={() => setActiveTab('register')}
              variant={activeTab === 'register' ? 'secondary' : 'primary'}
              className="flex-1 justify-center rounded-none"
            >
              <span>➕</span>
              <span className="ml-2">Register Student</span>
            </PortalButton>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'list' ? (
            <StudentList />
          ) : (
            <StudentForm 
              onSuccess={handleStudentRegistered}
              programmes={courses}
              classes={classes}
            />
          )}
        </div>
      </PortalCard>
    </div>
  );
}