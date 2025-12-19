import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';

interface Course {
  id: number;
  name: string;
  code: string;
}

interface Class {
  id: number;
  class_name: string;
  form: number;
}

interface StudentFormData {
  surname: string;
  other_names: string;
  gender: string;
  date_of_birth: string;
  house_preference: string;
  course_id: number;
  current_class_id: number;
  guardian_name: string;
  guardian_relationship: string;
  guardian_contact: string;
  address: string;
  phone: string;
  email: string;
}

export const AdminStudentRegistration: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState<StudentFormData>({
    surname: '',
    other_names: '',
    gender: '',
    date_of_birth: '',
    house_preference: '',
    course_id: 0,
    current_class_id: 0,
    guardian_name: '',
    guardian_relationship: '',
    guardian_contact: '',
    address: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    fetchCoursesAndClasses();
  }, []);

  const fetchCoursesAndClasses = async () => {
    try {
      // In a real implementation, these would fetch from the database
      // For now, we'll use mock data
      setCourses([
        { id: 1, name: 'General Art', code: 'GA' },
        { id: 2, name: 'Business', code: 'BUS' },
        { id: 3, name: 'General Science', code: 'GS' },
        { id: 4, name: 'Visual Art', code: 'VA' },
        { id: 5, name: 'General Agricultural', code: 'AGRIC' },
        { id: 6, name: 'Home Economics', code: 'HE' }
      ]);
      
      setClasses([
        { id: 1, class_name: 'General Art 1A S1', form: 1 },
        { id: 2, class_name: 'General Art 1B S1', form: 1 },
        { id: 3, class_name: 'Business 1A S1', form: 1 },
        { id: 4, class_name: 'Business 1B S1', form: 1 },
        { id: 5, class_name: 'General Science 1A S1', form: 1 },
        { id: 6, class_name: 'General Science 1B S1', form: 1 }
      ]);
    } catch (error) {
      console.error('Error fetching courses and classes:', error);
      toast.error('Failed to load courses and classes');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real implementation, this would register the student in the database
      // For now, we'll just show a success message
      toast.success('Student registered successfully!');
      setFormData({
        surname: '',
        other_names: '',
        gender: '',
        date_of_birth: '',
        house_preference: '',
        course_id: 0,
        current_class_id: 0,
        guardian_name: '',
        guardian_relationship: '',
        guardian_contact: '',
        address: '',
        phone: '',
        email: ''
      });
    } catch (error) {
      console.error('Error registering student:', error);
      toast.error('Failed to register student');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!studentId.trim()) {
      toast.error('Please enter a Student ID');
      return;
    }
    
    try {
      setLoading(true);
      // In a real implementation, this would search for the student in the database
      // For now, we'll just show a message
      toast.success('Student found! Loading details...');
      setIsEditing(true);
    } catch (error) {
      console.error('Error searching for student:', error);
      toast.error('Student not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Registration</h2>
        
        <div className="mb-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Existing Student (by ID)</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  placeholder="Enter Student ID (e.g., STU001)"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>
          
          {isEditing && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">Editing existing student. Make changes and save to update.</p>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Names *</label>
                  <input
                    type="text"
                    name="other_names"
                    value={formData.other_names}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House Preference</label>
                  <input
                    type="text"
                    name="house_preference"
                    value={formData.house_preference}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Academic Information */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Class *</label>
                  <select
                    name="current_class_id"
                    value={formData.current_class_id}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.class_name} (Form {cls.form})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Guardian Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name *</label>
                  <input
                    type="text"
                    name="guardian_name"
                    value={formData.guardian_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                  <input
                    type="text"
                    name="guardian_relationship"
                    value={formData.guardian_relationship}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
                  <input
                    type="text"
                    name="guardian_contact"
                    value={formData.guardian_contact}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="md:col-span-2 bg-gray-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  surname: '',
                  other_names: '',
                  gender: '',
                  date_of_birth: '',
                  house_preference: '',
                  course_id: 0,
                  current_class_id: 0,
                  guardian_name: '',
                  guardian_relationship: '',
                  guardian_contact: '',
                  address: '',
                  phone: '',
                  email: ''
                });
                setIsEditing(false);
                setStudentId('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Registering...'}
                </span>
              ) : isEditing ? (
                'Update Student'
              ) : (
                'Register Student'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Student ID Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Student ID Information</h3>
        <p className="text-blue-700">
          Student IDs are automatically generated in the format <code className="bg-blue-100 px-1 rounded">STU[Year][Number]</code> 
          (e.g., STU2025001 for the first student registered in 2025).
        </p>
        <p className="text-blue-700 mt-2">
          Upon registration, students will receive an auto-generated password which they can change after first login.
        </p>
      </div>
    </div>
  );
};