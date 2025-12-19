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

interface AssignmentStats {
  totalAssignments: number;
  pendingSubmissions: number;
  completedSubmissions: number;
  overdueAssignments: number;
  averageSubmissionRate: number;
}

interface TeacherAssignmentsAnalyticsProps {
  teacherId: number;
}

export const TeacherAssignmentsAnalytics: React.FC<TeacherAssignmentsAnalyticsProps> = ({ teacherId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentStats>({
    totalAssignments: 0,
    pendingSubmissions: 0,
    completedSubmissions: 0,
    overdueAssignments: 0,
    averageSubmissionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await db.getAssignmentsByTeacher(teacherId);
      setAssignments(data as Assignment[]);
      
      // Calculate stats
      const totalAssignments = data.length;
      const overdueAssignments = data.filter(a => new Date(a.due_date) < new Date()).length;
      
      // Mock submission data (in a real app, this would come from the database)
      const pendingSubmissions = Math.floor(totalAssignments * 0.3);
      const completedSubmissions = totalAssignments * 25; // Assuming 25 students per assignment avg
      const averageSubmissionRate = totalAssignments > 0 ? Math.round((completedSubmissions / (totalAssignments * 25)) * 100) : 0;
      
      setStats({
        totalAssignments,
        pendingSubmissions,
        completedSubmissions,
        overdueAssignments,
        averageSubmissionRate
      });
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  // Group assignments by type
  const getAssignmentsByType = () => {
    const typeCounts: Record<string, number> = {};
    
    assignments.forEach(assignment => {
      const type = assignment.assignment_type;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / assignments.length) * 100)
    }));
  };

  // Get recent assignments
  const getRecentAssignments = () => {
    return [...assignments]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  // Get upcoming assignments
  const getUpcomingAssignments = () => {
    return [...assignments]
      .filter(a => new Date(a.due_date) >= new Date())
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  const assignmentsByType = getAssignmentsByType();
  const recentAssignments = getRecentAssignments();
  const upcomingAssignments = getUpcomingAssignments();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Assignment Analytics</h2>
          <p className="text-gray-600">Insights and overview of your assignments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
          <div className="text-3xl font-bold text-school-green-600">{stats.totalAssignments}</div>
          <div className="text-gray-600 mt-2">Total Assignments</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
          <div className="text-3xl font-bold text-blue-600">{stats.averageSubmissionRate}%</div>
          <div className="text-gray-600 mt-2">Avg. Submission Rate</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
          <div className="text-3xl font-bold text-yellow-600">{stats.pendingSubmissions}</div>
          <div className="text-gray-600 mt-2">Pending Grading</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
          <div className="text-3xl font-bold text-purple-600">{stats.completedSubmissions}</div>
          <div className="text-gray-600 mt-2">Total Submissions</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
          <div className="text-3xl font-bold text-red-600">{stats.overdueAssignments}</div>
          <div className="text-gray-600 mt-2">Overdue</div>
        </div>
      </div>

      {/* Charts and Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Types Chart */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Assignment Types</h3>
          <div className="space-y-4">
            {assignmentsByType.map((item, index) => (
              <div key={item.type}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.type}</span>
                  <span className="text-sm font-medium text-gray-700">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-school-green-600 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Assignments</h3>
          <div className="space-y-4">
            {recentAssignments.map(assignment => (
              <div key={assignment.id} className="flex items-center p-3 hover:bg-school-cream-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-school-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-school-green-800 font-bold">A</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                  <div className="text-sm text-gray-500">{assignment.class_name} • {assignment.subject_name}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(assignment.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-school-green-600 text-white p-6">
          <h3 className="text-xl font-bold">Upcoming Assignments</h3>
          <p className="text-school-green-100">
            Assignments due in the next 30 days
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-school-cream-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Days Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-school-cream-200">
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.map((assignment) => {
                  const dueDate = new Date(assignment.due_date);
                  const today = new Date();
                  const timeDiff = dueDate.getTime() - today.getTime();
                  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
                  
                  return (
                    <tr key={assignment.id} className="hover:bg-school-cream-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{assignment.class_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{assignment.subject_name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {assignment.assignment_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {dueDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-medium ${
                          daysLeft <= 3 ? 'text-red-600' : 
                          daysLeft <= 7 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {daysLeft} days
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-4">📅</div>
                      <p className="text-lg font-medium">No upcoming assignments</p>
                      <p className="text-sm">All assignments are either completed or overdue</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};