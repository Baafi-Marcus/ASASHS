import React, { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { StudentDetailsModal } from './StudentDetailsModal';

interface Student {
  id: number;
  student_id: string;
  admission_number: string;
  surname: string;
  other_names: string;
  gender: string;
  course_id: number;
  current_class_id: number;
  course_name?: string;
  class_name?: string;
  house_preference?: string;
  is_active: boolean;
}

interface Programme {
  id: number;
  name: string;
}

interface ClassItem {
  id: number;
  class_name: string;
  form: number;
  stream: string | null;
}

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [programme, setProgramme] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [unassignedHouse, setUnassignedHouse] = useState<boolean>(false);
  const [house5Filter, setHouse5Filter] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    fetchStudents();
    fetchProgrammesAndClasses();
  }, [search, programme, gender, unassignedHouse, house5Filter, page]);

  const fetchProgrammesAndClasses = async () => {
    try {
      const [programmesData, classesData] = await Promise.all([
        db.getCourses(),
        db.getClasses()
      ]);
      
      setProgrammes(programmesData);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to fetch programmes and classes:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    
    try {
      const filters: any = {
        page: page,
        limit: pageSize,
        includeInactive: true
      };
      
      if (search) {
        filters.search = search;
      }
      
      if (programme) {
        filters.course_id = parseInt(programme);
      }
      
      if (gender) {
        filters.gender = gender;
      }
      
      if (unassignedHouse) {
        filters.unassignedHouse = true;
      }
      
      // Add House 5 filter
      if (house5Filter) {
        filters.house5 = true;
      }
      
      const studentsData = await db.getStudents(filters);
      setStudents(studentsData as Student[]);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Add explicit search function
  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchStudents();
  };

  // Function to assign all unassigned students to House 5
  const handleAssignToHouse5 = async () => {
    if (window.confirm('Are you sure you want to assign all unassigned students to House 5? This action cannot be undone.')) {
      try {
        const result = await db.assignUnassignedToHouse5();
        toast.success(result.message);
        fetchStudents(); // Refresh the list
      } catch (error) {
        console.error('Failed to assign students to House 5:', error);
        toast.error('Failed to assign students to House 5: ' + (error as Error).message);
      }
    }
  };

  const handleViewDetails = (studentId: number) => {
    setSelectedStudentId(studentId);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeactivateStudent = async (studentId: number) => {
    if (window.confirm('Are you sure you want to deactivate this student? The student will no longer be able to log in, but their account will remain in the system.')) {
      try {
        await db.deactivateStudent(studentId);
        toast.success('Student deactivated successfully');
        fetchStudents(); // Refresh the list
      } catch (error) {
        console.error('Failed to deactivate student:', error);
        toast.error('Failed to deactivate student: ' + (error as Error).message);
      }
    }
  };

  const handleReactivateStudent = async (studentId: number) => {
    if (window.confirm('Are you sure you want to reactivate this student? The student will be able to log in again.')) {
      try {
        await db.reactivateStudent(studentId);
        toast.success('Student reactivated successfully');
        fetchStudents(); // Refresh the list
      } catch (error) {
        console.error('Failed to reactivate student:', error);
        toast.error('Failed to reactivate student: ' + (error as Error).message);
      }
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone and will permanently remove all student data.')) {
      try {
        await db.deleteStudent(studentId);
        toast.success('Student deleted successfully');
        fetchStudents(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete student:', error);
        toast.error('Failed to delete student: ' + (error as Error).message);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStudentId(null);
    setIsEditing(false);
  };

  const handleStudentUpdated = () => {
    fetchStudents(); // Refresh the student list
  };

  const getProgrammeName = (courseId: number) => {
    const programmes: Record<number, string> = {
      1: "General Science",
      2: "Business",
      3: "Visual Art",
      4: "General Art",
      5: "General Agricultural",
      6: "Home Economics"
    };
    return programmes[courseId] || "Unknown";
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border-2 border-school-cream-200 overflow-hidden">
      <div className="p-6 border-b border-school-cream-200">
        <h2 className="text-2xl font-bold text-gray-800">Student List</h2>
      </div>
      <div className="p-6">
        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex">
            <input
              type="text"
              placeholder="Search by name or index..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="bg-school-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-school-green-700 transition-colors"
            >
              Search
            </button>
          </div>

          <select
            value={programme || ''}
            onChange={(e) => setProgramme(e.target.value || null)}
            className="w-48 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
          >
            <option value="">Filter by Programme</option>
            <option value="1">General Science</option>
            <option value="2">Business</option>
            <option value="3">Visual Art</option>
            <option value="4">General Art</option>
            <option value="5">General Agricultural</option>
            <option value="6">Home Economics</option>
          </select>

          <select
            value={gender || ''}
            onChange={(e) => setGender(e.target.value || null)}
            className="w-40 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Filter for unassigned houses */}
          <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg">
            <input
              type="checkbox"
              checked={unassignedHouse}
              onChange={(e) => setUnassignedHouse(e.target.checked)}
              className="rounded text-school-green-600 focus:ring-school-green-500"
            />
            <span className="text-sm">Unassigned Houses</span>
          </label>

          {/* New filter for House 5 */}
          <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg">
            <input
              type="checkbox"
              checked={house5Filter}
              onChange={(e) => setHouse5Filter(e.target.checked)}
              className="rounded text-school-green-600 focus:ring-school-green-500"
            />
            <span className="text-sm">House 5 Only</span>
          </label>

          {/* Button to assign unassigned students to House 5 */}
          <button
            onClick={handleAssignToHouse5}
            className="bg-school-green-600 text-white px-4 py-2 rounded-lg hover:bg-school-green-700 transition-colors"
          >
            Assign Unassigned to House 5
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-school-cream-100 text-left">
                <th className="p-3 border-b">Student ID</th>
                <th className="p-3 border-b">Name</th>
                <th className="p-3 border-b">Gender</th>
                <th className="p-3 border-b">Programme</th>
                <th className="p-3 border-b">Class</th>
                <th className="p-3 border-b">House</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center">Loading...</td>
                </tr>
              ) : students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.id} className="border-t hover:bg-school-cream-50">
                    <td className="p-3">{s.student_id || s.admission_number}</td>
                    <td className="p-3">{s.surname} {s.other_names}</td>
                    <td className="p-3">{s.gender}</td>
                    <td className="p-3">{s.course_name || getProgrammeName(s.course_id)}</td>
                    <td className="p-3">{s.class_name || 'Not assigned'}</td>
                    <td className="p-3">{s.house_preference || 'Not assigned'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {s.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(s.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleEditStudent(s.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit Student"
                        >
                          ✏️
                        </button>
                        {s.is_active ? (
                          <button
                            onClick={() => handleDeactivateStudent(s.id)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Deactivate Student"
                          >
                            ⏸️
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivateStudent(s.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Reactivate Student"
                          >
                            ▶️
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteStudent(s.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Student"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={() => setPage((p) => Math.max(1, p - 1))} 
            disabled={page === 1}
            className="bg-school-green-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 hover:bg-school-green-700"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button 
            onClick={() => setPage((p) => p + 1)}
            className="bg-school-green-600 text-white px-4 py-2 rounded-lg hover:bg-school-green-700"
          >
            Next
          </button>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudentId && (
        <StudentDetailsModal
          studentId={selectedStudentId}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onStudentUpdated={handleStudentUpdated}
          programmes={programmes}
          classes={classes}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      )}
    </div>
  );
}