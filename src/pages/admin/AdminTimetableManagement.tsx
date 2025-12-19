import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

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
  }, []);

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
      
      // Fetch existing timetable entries
      const entries: any = await db.getTimetableEntries({ academic_year: academicYear });
      setTimetableEntries(entries as TimetableEntry[]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
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
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    
    try {
      // Read the Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Clear existing timetable entries for this academic year
      await db.deleteTimetableEntries(academicYear);
      
      // Process each row and create timetable entries
      let successCount = 0;
      let errorCount = 0;
      
      for (const row of jsonData as Record<string, any>[]) {
        try {
          // Extract data from row
          const day = row['Day'] || row['day'];
          const timeSlot = row['Time Slot'] || row['Time_Slot'] || row['time_slot'];
          const className = row['Class'] || row['class'];
          const subjectName = row['Subject'] || row['subject'];
          const teacherName = row['Teacher'] || row['teacher'];
          
          if (!day || !timeSlot || !className || !subjectName || !teacherName) {
            console.warn('Skipping row with missing data:', row);
            errorCount++;
            continue;
          }
          
          // Find matching class
          const classMatch = classes.find(c => 
            c.class_name.toLowerCase().includes(className.toString().toLowerCase())
          );
          
          if (!classMatch) {
            console.warn('Class not found:', className);
            errorCount++;
            continue;
          }
          
          // Find matching subject
          const subjectMatch = subjects.find(s => 
            s.name.toLowerCase() === subjectName.toString().toLowerCase() ||
            s.code.toLowerCase() === subjectName.toString().toLowerCase()
          );
          
          if (!subjectMatch) {
            console.warn('Subject not found:', subjectName);
            errorCount++;
            continue;
          }
          
          // Find matching teacher
          const teacherMatch = teachers.find(t => {
            const fullName = `${t.surname} ${t.other_names}`.toLowerCase();
            return fullName.includes(teacherName.toString().toLowerCase()) ||
                   t.teacher_id.toLowerCase().includes(teacherName.toString().toLowerCase());
          });
          
          if (!teacherMatch) {
            console.warn('Teacher not found:', teacherName);
            errorCount++;
            continue;
          }
          
          // Create timetable entry
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
          console.error('Error processing row:', error);
          errorCount++;
        }
      }
      
      toast.success(`Timetable uploaded successfully! ${successCount} entries added, ${errorCount} errors.`);
      fetchData(); // Refresh the timetable entries
    } catch (error) {
      console.error('Failed to upload timetable:', error);
      toast.error('Failed to upload timetable: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  const handleDownloadTemplate = () => {
    // Create a template Excel file
    const templateData = [
      {
        'Day': 'Mon',
        'Time Slot': '8-9 AM',
        'Class': 'General Science 1A S1',
        'Subject': 'Mathematics (Core)',
        'Teacher': 'TEA2025001'
      },
      {
        'Day': 'Tue',
        'Time Slot': '9-10 AM',
        'Class': 'General Art 1B S1',
        'Subject': 'English Language',
        'Teacher': 'TEA2025002'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable_Template');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, 'timetable_template.xlsx');
    toast.success('Template downloaded successfully!');
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Timetable Management</h2>
          <p className="text-gray-600">Upload and manage school timetables</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-school-cream-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Upload Timetable</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
            >
              <option value="2024/2025">2024/2025</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timetable File (Excel/CSV)</label>
            <div className="flex space-x-3">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="flex-1 px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
              />
              <button
                onClick={handleUpload}
                disabled={isUploading || !file}
                className={`px-6 py-3 rounded-lg font-medium ${
                  isUploading || !file
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-school-green-600 text-white hover:bg-school-green-700'
                }`}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Excel files should have columns: Day, Time Slot, Class, Subject, Teacher
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleDownloadTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>⬇️</span>
            <span>Download Template</span>
          </button>
        </div>
      </div>

      {/* Timetable Entries */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-school-cream-200 overflow-hidden">
        <div className="bg-school-green-600 text-white p-6">
          <h3 className="text-xl font-bold">Timetable Entries ({timetableEntries.length})</h3>
          <p className="text-school-green-100">Academic Year: {academicYear}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-school-cream-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Day</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Time Slot</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Teacher</th>
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
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {entry.teacher_surname} {entry.teacher_other_names}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-4">📅</div>
                      <p className="text-lg font-medium">No timetable entries found</p>
                      <p className="text-sm">Upload a timetable file to get started</p>
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

export default AdminTimetableManagement;