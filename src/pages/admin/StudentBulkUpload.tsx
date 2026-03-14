import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';

interface StudentBulkUploadProps {
  onSuccess: () => void;
  courses: { id: number; name: string }[];
  classes: { id: number; class_name: string }[];
}

export const StudentBulkUpload: React.FC<StudentBulkUploadProps> = ({ onSuccess, courses, classes }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const data = lines.slice(1).filter(line => line.trim() !== '').map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = values[i];
        });
        return obj;
      });
      
      setPreview(data.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const studentsToImport = lines.slice(1).filter(line => line.trim() !== '').map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, i) => {
            obj[header] = values[i];
          });
          
          // Map class and course names to IDs
          const classMatch = classes.find(c => c.class_name.toLowerCase() === obj.class?.toLowerCase());
          const courseMatch = courses.find(c => c.name.toLowerCase() === obj.course?.toLowerCase() || c.name.toLowerCase() === obj.programme?.toLowerCase());
          
          if (!classMatch || !courseMatch) {
            throw new Error(`Invalid class or course name in row: ${line}`);
          }
          
          return {
            surname: obj.surname || obj.lastname || '',
            other_names: obj.other_names || obj.firstname || '',
            class_id: classMatch.id,
            course_id: courseMatch.id
          };
        });

        const results = await db.bulkImportStudents(studentsToImport);
        toast.success(`Successfully imported ${results.length} students`);
        
        // Export credentials to CSV for the admin
        exportCredentials(results);
        onSuccess();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const exportCredentials = (results: any[]) => {
    const headers = ['Name', 'Student ID', 'Admission Number', 'Temporary Password'];
    const rows = results.map(r => [r.name, r.studentId, r.admissionNum, r.tempPassword]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_credentials_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-school-cream-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Bulk Student Upload</h3>
      <p className="text-gray-600 mb-6 font-medium">
        Upload a CSV file with headers: <code className="bg-gray-100 px-2 py-1 rounded">surname, other_names, class, course</code>
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <span className="text-3xl mb-2 text-gray-400">📄</span>
              <p className="mb-2 text-sm text-gray-500 font-medium">
                {file ? file.name : "Click to upload CSV student list"}
              </p>
            </div>
            <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} disabled={uploading} title="student list csv file"/>
          </label>
        </div>

        {preview.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Data Preview (first 5 rows):</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left text-gray-500">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(preview[0]).map(h => <th key={h} className="px-2 py-1 font-bold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t">
                      {Object.values(row).map((v: any, j) => <td key={j} className="px-2 py-1">{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-school-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-school-green-700 transition-all disabled:opacity-50"
        >
          {uploading ? 'Processing...' : 'Upload & Generate IDs'}
        </button>
      </div>
    </div>
  );
};
