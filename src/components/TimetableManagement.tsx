import React, { useState, useEffect } from 'react';
import { db } from '../../lib/neon';
import toast from 'react-hot-toast';

interface Class {
  id: number;
  class_name: string;
  course_id: number;
  form: number;
  stream: string | null;
  academic_year: string;
  capacity: number;
  is_active: boolean;
}

interface Timetable {
  id: number;
  class_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  academic_year: string;
  uploaded_by: number;
  uploaded_by_user: string;
  is_active: boolean;
  created_at: string;
  class_name: string;
}

interface TimetableManagementProps {
  userId: number;
}

export function TimetableManagement({ userId }: TimetableManagementProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [academicYear, setAcademicYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesData, timetablesData] = await Promise.all([
        db.getClasses(),
        db.getTimetables()
      ]);
      
      setClasses(classesData as Class[]);
      setTimetables(timetablesData as Timetable[]);
      
      // Set default academic year
      const currentYear = new Date().getFullYear();
      setAcademicYear(`${currentYear}/${currentYear + 1}`);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      if (fileType === 'pdf' || fileType === 'xlsx' || fileType === 'xls') {
        setSelectedFile(file);
      } else {
        toast.error('Please upload a PDF or Excel file');
        e.target.value = ''; // Reset the input
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass || !selectedFile || !academicYear) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setUploading(true);
      
      // In a real implementation, you would upload the file to a storage service
      // and save the file path in the database
      const filePath = `/timetables/${selectedClass}_${selectedFile.name}`;
      
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      
      const timetableData = {
        class_id: selectedClass as number,
        file_name: selectedFile.name,
        file_path: filePath,
        file_type: fileType === 'pdf' ? 'pdf' : 'excel',
        academic_year: academicYear,
        uploaded_by: userId
      };
      
      await db.uploadTimetable(timetableData);
      
      // Refresh timetables list
      const updatedTimetables = await db.getTimetables();
      setTimetables(updatedTimetables as Timetable[]);
      
      // Reset form
      setSelectedClass('');
      setSelectedFile(null);
      toast.success('Timetable uploaded successfully');
    } catch (error) {
      console.error('Failed to upload timetable:', error);
      toast.error('Failed to upload timetable');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (timetableId: number) => {
    if (window.confirm('Are you sure you want to delete this timetable?')) {
      try {
        await db.deleteTimetable(timetableId);
        
        // Refresh timetables list
        const updatedTimetables = await db.getTimetables();
        setTimetables(updatedTimetables as Timetable[]);
        
        toast.success('Timetable deleted successfully');
      } catch (error) {
        console.error('Failed to delete timetable:', error);
        toast.error('Failed to delete timetable');
      }
    }
  };

  const handleViewTimetable = (filePath: string) => {
    // In a real implementation, this would open the file in a new tab
    // For now, we'll show a toast message
    toast.success('Timetable would open in a new tab in a real implementation');
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
      {/* Upload Form */}
      <div className="bg-white rounded-2xl border-2 border-school-cream-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Upload New Timetable</h3>
        
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Class *</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as number | '')}
                className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                required
              >
                <option value="">Choose a class</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.class_name} (Form {classItem.form}{classItem.stream ? ` ${classItem.stream}` : ''})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2025/2026"
                className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Timetable File (PDF or Excel) *</label>
            <div className="flex items-center space-x-4">
              <label className="flex-1">
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, Excel (.xlsx, .xls)</p>
              </label>
            </div>
            {selectedFile && (
              <div className="mt-2 p-3 bg-school-green-50 rounded-lg border border-school-green-200">
                <p className="text-sm text-school-green-800">
                  <span className="font-medium">Selected file:</span> {selectedFile.name}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploading ? 'Uploading...' : 'Upload Timetable'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Timetables List */}
      <div className="bg-white rounded-2xl border-2 border-school-cream-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Uploaded Timetables</h3>
        
        {timetables.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-school-cream-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">File Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Academic Year</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Uploaded By</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-school-cream-200">
                {timetables.map((timetable) => (
                  <tr key={timetable.id} className="hover:bg-school-cream-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{timetable.class_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{timetable.file_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{timetable.academic_year}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{timetable.uploaded_by_user}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(timetable.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewTimetable(timetable.file_path)}
                          className="px-3 py-1 bg-school-green-100 text-school-green-700 rounded-lg hover:bg-school-green-200 transition-colors text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(timetable.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📅</div>
            <p className="text-gray-500 font-medium">No timetables uploaded yet</p>
            <p className="text-gray-400 text-sm mt-1">Upload a timetable to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}