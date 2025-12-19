import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface TimetableEntry {
  id: number;
  day: string;
  time_slot: string;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  academic_year: string;
  class_name: string;
  subject_name: string;
}

export function TeacherTimetable() {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [teacherId, setTeacherId] = useState<number | null>(null);

  useEffect(() => {
    // In a real implementation, you would get the teacher ID from auth context
    // For now, we'll simulate this
    const fetchTeacherId = async () => {
      try {
        // This is a placeholder - in reality, you'd get this from authentication
        const teacherId = 1; // Example teacher ID
        setTeacherId(teacherId);
        
        const entries: any = await db.getTeacherTimetable(teacherId, academicYear);
        setTimetableEntries(entries as TimetableEntry[]);
      } catch (error) {
        console.error('Failed to fetch timetable:', error);
        toast.error('Failed to load timetable');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherId();
  }, [academicYear]);

  const handleDownload = () => {
    // Convert timetable data to worksheet format
    const worksheetData = timetableEntries.map(entry => ({
      Day: entry.day,
      'Time Slot': entry.time_slot,
      Class: entry.class_name,
      Subject: entry.subject_name
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'My_Timetable');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `timetable_${academicYear}.xlsx`);
    toast.success('Timetable downloaded successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Group timetable entries by day for display
  const groupedEntries = timetableEntries.reduce((acc, entry) => {
    if (!acc[entry.day]) {
      acc[entry.day] = [];
    }
    acc[entry.day].push(entry);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  // Get all unique time slots
  const timeSlots = Array.from(
    new Set(timetableEntries.map(entry => entry.time_slot))
  ).sort();

  // Get all days of the week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Timetable</h2>
          <p className="text-gray-600">View and manage your personal timetable</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-4 py-2 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
          >
            <option value="2024/2025">2024/2025</option>
            <option value="2025/2026">2025/2026</option>
            <option value="2026/2027">2026/2027</option>
          </select>
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>⬇️</span>
            <span>Download</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <span>🖨️</span>
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-school-cream-200 overflow-hidden print:shadow-none print:border-none">
        <div className="bg-school-green-600 text-white p-6 print:bg-white print:text-black">
          <h3 className="text-xl font-bold">Teacher Timetable</h3>
          <p className="text-school-green-100 print:text-gray-600">Academic Year: {academicYear}</p>
        </div>
        
        <div className="overflow-x-auto p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-school-cream-100 print:bg-gray-100">Time Slot</th>
                {daysOfWeek.map(day => (
                  <th key={day} className="border p-2 bg-school-cream-100 print:bg-gray-100">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(timeSlot => (
                <tr key={timeSlot}>
                  <td className="border p-2 font-medium bg-school-cream-50 print:bg-gray-50">{timeSlot}</td>
                  {daysOfWeek.map(day => {
                    const entry = groupedEntries[day]?.find(e => e.time_slot === timeSlot);
                    return (
                      <td key={`${day}-${timeSlot}`} className="border p-2 h-24 align-top">
                        {entry ? (
                          <div className="space-y-1">
                            <div className="font-semibold text-sm">{entry.subject_name}</div>
                            <div className="text-xs text-gray-600">{entry.class_name}</div>
                          </div>
                        ) : (
                          <div className="text-gray-300 text-xs">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* List View (Alternative) */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-school-cream-200 overflow-hidden">
        <div className="bg-school-green-600 text-white p-6">
          <h3 className="text-xl font-bold">Timetable Entries</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-school-cream-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Day</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Time Slot</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Subject</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-school-cream-200">
              {timetableEntries.length > 0 ? (
                timetableEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-school-cream-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.day}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.time_slot}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.class_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.subject_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-4">📅</div>
                      <p className="text-lg font-medium">No timetable entries found</p>
                      <p className="text-sm">Contact admin to upload timetable</p>
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
}

export default TeacherTimetable;