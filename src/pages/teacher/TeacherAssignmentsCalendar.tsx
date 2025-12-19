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

interface TeacherAssignmentsCalendarProps {
  teacherId: number;
}

export const TeacherAssignmentsCalendar: React.FC<TeacherAssignmentsCalendarProps> = ({ teacherId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await db.getAssignmentsByTeacher(teacherId);
      setAssignments(data as Assignment[]);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    // Days from previous month to show
    const prevMonthDays = firstDay.getDay();
    // Days from next month to show
    const nextMonthDays = 6 - lastDay.getDay();
    
    const days = [];
    
    // Previous month days
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        assignments: getAssignmentsForDate(date)
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        assignments: getAssignmentsForDate(date)
      });
    }
    
    // Next month days
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        assignments: getAssignmentsForDate(date)
      });
    }
    
    return days;
  };

  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter(assignment => {
      const dueDate = new Date(assignment.due_date);
      return dueDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  const calendarDays = getCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Assignment Calendar</h2>
          <p className="text-gray-600">View and manage assignments by due date</p>
        </div>
        <button
          onClick={() => setSelectedDate(new Date())}
          className="bg-school-green-600 text-white px-4 py-2 rounded-lg hover:bg-school-green-700 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div 
              key={index}
              onClick={() => setSelectedDate(day.date)}
              className={`
                min-h-24 p-2 border rounded-lg cursor-pointer transition-colors
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                ${isToday(day.date) ? 'border-school-green-500 bg-school-green-50' : 'border-gray-200'}
                ${isSelected(day.date) ? 'ring-2 ring-school-green-500' : ''}
                hover:bg-school-cream-50
              `}
            >
              <div className="text-sm font-medium">
                {day.date.getDate()}
              </div>
              <div className="mt-1 space-y-1">
                {day.assignments.slice(0, 3).map(assignment => (
                  <div 
                    key={assignment.id}
                    className="text-xs p-1 bg-school-green-100 text-school-green-800 rounded truncate"
                    title={assignment.title}
                  >
                    {assignment.title}
                  </div>
                ))}
                {day.assignments.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{day.assignments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Assignments */}
      {selectedDate && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="bg-school-green-600 text-white p-6">
            <h3 className="text-xl font-bold">
              Assignments for {selectedDate.toDateString()}
            </h3>
            <p className="text-school-green-100">
              {getAssignmentsForDate(selectedDate).length} assignments due
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Submissions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-school-cream-200">
                {getAssignmentsForDate(selectedDate).length > 0 ? (
                  getAssignmentsForDate(selectedDate).map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-school-cream-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{assignment.description}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{assignment.class_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{assignment.subject_name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {assignment.assignment_type}
                        </span>
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
                        <div className="text-4xl mb-4">📅</div>
                        <p className="text-lg font-medium">No assignments due on this date</p>
                        <p className="text-sm">Select another date or create a new assignment</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};