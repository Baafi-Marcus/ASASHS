import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import {
  CalendarDaysIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import { PortalButton } from '../../components/PortalButton';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

interface Class {
  id: number;
  class_name: string;
  course_id: number;
  form: number;
  semester: number;
  stream: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  course_id: number | null;
  is_core: boolean;
}

interface Teacher {
  id: number;
  surname: string;
  other_names: string;
  teacher_id: string;
}

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
  teacher_surname: string;
  teacher_other_names: string;
}

export function AdminTimetableManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [academicYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesData, subjectsData, teachersData] = await Promise.all([
        db.getClasses(),
        db.getSubjects(),
        db.getTeachers()
      ]);
      
      setClasses(classesData as Class[]);
      setSubjects(subjectsData as Subject[]);
      setTeachers(teachersData as Teacher[]);
      
      const entries: any = await db.getTimetableEntries({ academic_year: academicYear });
      setTimetableEntries((entries as TimetableEntry[]) || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load schedule and timetable data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an Excel or CSV file to upload');
      return;
    }

    setIsUploading(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      await db.deleteTimetableEntries(academicYear);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const row of jsonData as Record<string, any>[]) {
        try {
          const day = row['Day'] || row['day'];
          const timeSlot = row['Time Slot'] || row['Time_Slot'] || row['time_slot'];
          const className = row['Class'] || row['class'];
          const subjectName = row['Subject'] || row['subject'];
          const teacherName = row['Teacher'] || row['teacher'];
          
          if (!day || !timeSlot || !className || !subjectName || !teacherName) {
            errorCount++;
            continue;
          }
          
          const classMatch = classes.find(c => 
            c.class_name.toLowerCase().includes(className.toString().toLowerCase())
          );
          
          if (!classMatch) {
            errorCount++;
            continue;
          }
          
          const subjectMatch = subjects.find(s => 
            s.name.toLowerCase() === subjectName.toString().toLowerCase() ||
            s.code.toLowerCase() === subjectName.toString().toLowerCase()
          );
          
          if (!subjectMatch) {
            errorCount++;
            continue;
          }
          
          const teacherMatch = teachers.find(t => {
            const fullName = `${t.surname} ${t.other_names}`.toLowerCase();
            return fullName.includes(teacherName.toString().toLowerCase()) ||
                   t.teacher_id.toLowerCase().includes(teacherName.toString().toLowerCase());
          });
          
          if (!teacherMatch) {
            errorCount++;
            continue;
          }
          
          await db.createTimetableEntry({
            day: day.toString(),
            time_slot: timeSlot.toString(),
            class_id: classMatch.id,
            subject_id: subjectMatch.id,
            teacher_id: teacherMatch.id,
            academic_year: academicYear
          });
          
          successCount++;
        } catch (error) {
          console.error('Error processing timetable row:', error);
          errorCount++;
        }
      }
      
      toast.success(`Timetable updated! ${successCount} slots scheduled, ${errorCount} rejected.`);
      fetchData();
    } catch (error) {
      console.error('Failed to upload timetable:', error);
      toast.error('Failed to upload timetable: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Day': 'Mon',
        'Time Slot': '08:00 - 09:00',
        'Class': 'General Science 1A',
        'Subject': 'Core Mathematics',
        'Teacher': 'TEA2025001'
      },
      {
        'Day': 'Tue',
        'Time Slot': '09:00 - 10:00',
        'Class': 'General Arts 1B',
        'Subject': 'English Language',
        'Teacher': 'TEA2025002'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable_Template');
    XLSX.writeFile(workbook, 'asashs_timetable_template.xlsx');
    toast.success('Template workbook downloaded');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" rows={2} />
        <LoadingSkeleton variant="table" rows={6} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Curriculum Timetable & Schedule Operations</h2>
          <p className="text-xs text-gray-500 mt-0.5">Maintain master weekly schedule allocations for all classes and faculty members</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Academic Session</span>
          <span className="text-xs font-semibold text-gray-800 tabular-nums">{academicYear}</span>
        </div>
      </div>

      {/* Upload & Configuration Section */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 space-y-4">
        <div className="pb-3 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Upload Master Schedule File</h3>
            <p className="text-xs text-gray-500 mt-0.5">Import structured Excel or CSV timetable files with day, time slot, class arm, and instructor columns</p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors shadow-2xs self-start"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5 text-gray-500" />
            <span>Download CSV/Excel Template</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Target Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white tabular-nums"
            >
              <option value="2024/2025">2024/2025</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
            </select>
          </div>
          
          <div>
            <label className="block font-medium text-gray-700 mb-1">Spreadsheet File (.xlsx, .xls, .csv)</label>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-sm bg-white text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              <PortalButton
                onClick={handleUpload}
                disabled={isUploading || !file}
                className="px-5 py-2 bg-school-green-700 text-white rounded-sm font-medium hover:bg-school-green-800 disabled:opacity-40 transition-colors shadow-2xs"
              >
                {isUploading ? 'Importing...' : 'Upload File'}
              </PortalButton>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Required headers: <code className="font-mono text-gray-600">Day</code>, <code className="font-mono text-gray-600">Time Slot</code>, <code className="font-mono text-gray-600">Class</code>, <code className="font-mono text-gray-600">Subject</code>, <code className="font-mono text-gray-600">Teacher</code>
            </p>
          </div>
        </div>
      </div>

      {/* Master Timetable Entries Grid */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Scheduled Instructional Periods</h3>
            <p className="text-xs text-gray-500 mt-0.5">Active weekly roster entries for session {academicYear}</p>
          </div>
          <span className="text-xs text-gray-500 tabular-nums font-mono">
            {timetableEntries.length} periods active
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Day</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Time Slot</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Class Arm</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Curriculum Subject</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Assigned Instructor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {timetableEntries.length > 0 ? (
                timetableEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-sm text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {entry.day}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700 tabular-nums font-medium">{entry.time_slot}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{entry.class_name}</td>
                    <td className="px-4 py-3 text-gray-700">{entry.subject_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {entry.teacher_surname} {entry.teacher_other_names}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-xs text-gray-400">
                    No scheduled timetable entries recorded for {academicYear}. Upload a master schedule above.
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

export default AdminTimetableManagement;