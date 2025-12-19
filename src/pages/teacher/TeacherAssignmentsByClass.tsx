import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';

interface Assignment {
  id: number;
  title: string;
  description: string;
  class_name: string;
  subject_name: string;
  assignment_type: string;
  due_date: string;
  max_score: number;
  created_at: string;
}

interface ClassGroup {
  class_name: string;
  assignments: Assignment[];
}

interface TeacherAssignmentsByClassProps {
  teacherId: number;
}

export const TeacherAssignmentsByClass: React.FC<TeacherAssignmentsByClassProps> = ({ teacherId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [groupedAssignments, setGroupedAssignments] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await db.getAssignmentsByTeacher(teacherId);
      setAssignments(data as Assignment[]);
      
      // Group assignments by class
      const grouped = data.reduce((acc: ClassGroup[], assignment: Assignment) => {
        const existingClass = acc.find(c => c.class_name === assignment.class_name);
        if (existingClass) {
          existingClass.assignments.push(assignment);
        } else {
          acc.push({
            class_name: assignment.class_name,
            assignments: [assignment]
          });
        }
        return acc;
      }, []);
      
      setGroupedAssignments(grouped);
      
      // Expand all classes by default
      const expandedState: Record<string, boolean> = {};
      grouped.forEach(group => {
        expandedState[group.class_name] = true;
      });
      setExpandedClasses(expandedState);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = (className: string) => {
    setExpandedClasses(prev => ({
      ...prev,
      [className]: !prev[className]
    }));
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
          <h2 className="text-2xl font-bold text-gray-800">Assignments by Class</h2>
          <p className="text-gray-600">View and manage assignments organized by class</p>
        </div>
      </div>

      {/* Class Groups */}
      <div className="space-y-4">
        {groupedAssignments.map((group) => (
          <div key={group.class_name} className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <div 
              className="bg-school-green-600 text-white p-6 flex justify-between items-center cursor-pointer"
              onClick={() => toggleClass(group.class_name)}
            >
              <div>
                <h3 className="text-xl font-bold">{group.class_name}</h3>
                <p className="text-school-green-100">
                  {group.assignments.length} assignments
                </p>
              </div>
              <div className="transform transition-transform duration-200">
                <svg 
                  className={`w-6 h-6 ${expandedClasses[group.class_name] ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {expandedClasses[group.class_name] && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-school-cream-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Subject</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Due Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Submissions</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-school-cream-200">
                    {group.assignments.length > 0 ? (
                      group.assignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-school-cream-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{assignment.description}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{assignment.subject_name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {assignment.assignment_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(assignment.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <span className="text-blue-600 font-medium">12/25</span> submitted
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <button className="text-school-green-600 hover:text-school-green-800 mr-3">
                              View
                            </button>
                            <button className="text-blue-600 hover:text-blue-800 mr-3">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <div className="text-4xl mb-4">📝</div>
                            <p className="text-lg font-medium">No assignments for this class</p>
                            <p className="text-sm">Create your first assignment to get started</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {groupedAssignments.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-12 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-lg font-medium">No assignments created yet</p>
            <p className="text-sm">Create your first assignment to see it organized by class</p>
          </div>
        </div>
      )}
    </div>
  );
};