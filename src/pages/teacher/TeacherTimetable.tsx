import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';

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

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const teacherId = 1; // Default teacher id from context
        const entries: any = await db.getTeacherTimetable(teacherId, academicYear);
        setTimetableEntries((entries || []) as TimetableEntry[]);
      } catch (error) {
        console.error('Failed to fetch timetable:', error);
        toast.error('Failed to load timetable');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimetable();
  }, [academicYear]);

  const handleDownload = () => {
    const worksheetData = timetableEntries.map(entry => ({
      Day: entry.day,
      'Time Slot': entry.time_slot,
      Class: entry.class_name,
      Subject: entry.subject_name
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'My_Timetable');
    XLSX.writeFile(workbook, `timetable_${academicYear}.xlsx`);
    toast.success('Timetable downloaded successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  const groupedEntries = timetableEntries.reduce((acc, entry) => {
    if (!acc[entry.day]) {
      acc[entry.day] = [];
    }
    acc[entry.day].push(entry);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  const timeSlots = Array.from(
    new Set(timetableEntries.map(entry => entry.time_slot))
  ).sort();

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Faculty Instructional Timetable</h2>
          <p className="text-xs text-gray-500">Weekly class periods, lab schedules, and subject allocations</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="min-h-[38px] px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-900 focus:outline-none focus:border-school-green-600 tabular-nums"
          >
            <option value="2024/2025">2024/2025</option>
            <option value="2025/2026">2025/2026</option>
            <option value="2026/2027">2026/2027</option>
          </select>
          <PortalButton
            onClick={handleDownload}
            variant="secondary"
            className="text-xs !min-h-[38px] !py-1"
          >
            Export Sheet
          </PortalButton>
          <PortalButton
            onClick={handlePrint}
            variant="secondary"
            className="text-xs !min-h-[38px] !py-1"
          >
            Print
          </PortalButton>
        </div>
      </div>

      {/* Timetable Grid */}
      <PortalCard className="overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Weekly Schedule Matrix</h3>
            <p className="text-xs text-gray-500 tabular-nums">Academic Year: {academicYear}</p>
          </div>
        </div>
        
        <div className="overflow-x-auto p-4">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="border border-gray-200 p-2.5 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Period / Time
                </th>
                {daysOfWeek.map(day => (
                  <th key={day} className="border border-gray-200 p-2.5 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(timeSlot => (
                <tr key={timeSlot}>
                  <td className="border border-gray-200 p-2.5 font-mono text-xs font-medium bg-gray-50/50 tabular-nums text-gray-700">
                    {timeSlot}
                  </td>
                  {daysOfWeek.map(day => {
                    const entry = groupedEntries[day]?.find(e => e.time_slot === timeSlot);
                    return (
                      <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-2.5 h-20 align-top">
                        {entry ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs text-gray-900">{entry.subject_name}</div>
                            <div className="text-[11px] text-school-green-800 font-semibold">{entry.class_name}</div>
                          </div>
                        ) : (
                          <div className="text-gray-300 text-xs text-center">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {timeSlots.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-gray-500">
                    No scheduled periods assigned for this academic year.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PortalCard>
    </div>
  );
}

export default TeacherTimetable;