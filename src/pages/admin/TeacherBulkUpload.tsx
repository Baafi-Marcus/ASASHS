import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';

interface TeacherBulkUploadProps {
  onSuccess: () => void;
}

export const TeacherBulkUpload: React.FC<TeacherBulkUploadProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [results, setResults] = useState<any[] | null>(null);

  const downloadTemplate = () => {
    const headers = ['surname', 'other_names', 'staff_id', 'department', 'gender', 'title', 'position_rank'];
    const sampleRows = [
      ['Agyapong', 'John', 'STAFF001', 'Mathematics', 'Male', 'Mr.', 'Teacher'],
      ['Asante', 'Grace', '', 'Science', 'Female', 'Mrs.', 'Senior Teacher'],
      ['Osei', 'Samuel', 'STAFF003', 'English', 'Male', 'Mr.', 'HoD'],
    ];
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + sampleRows.map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "teacher_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.csv')) { toast.error('Please upload a CSV file'); return; }
      setFile(selectedFile);
      setResults(null);
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
        headers.forEach((header, i) => { obj[header] = values[i]; });
        return obj;
      });
      setPreview(data.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a file first'); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const teachersToImport = lines.slice(1).filter(line => line.trim() !== '').map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, i) => { obj[header] = values[i]; });
          return {
            surname: obj.surname || '',
            other_names: obj.other_names || '',
            staff_id: obj.staff_id || obj.staffid || '',
            department: obj.department || '',
            gender: obj.gender || 'Male',
            title: obj.title || 'Mr.',
            position_rank: obj.position_rank || obj.position || obj.rank || 'Teacher'
          };
        });
        const imported = await db.bulkImportTeachers(teachersToImport);
        toast.success(`Successfully imported ${imported.length} teachers`);
        setResults(imported);
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

  const downloadCredentials = () => {
    if (!results) return;
    const headers = ['Name', 'Teacher ID', 'Staff ID', 'Temporary Password'];
    const rows = results.map(r => [r.name, r.teacherId, r.staffId, r.tempPassword]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `teacher_credentials_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-school-cream-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">Bulk Teacher Upload</h3>
        <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-1.5 bg-school-green-100 text-school-green-700 rounded-lg text-xs font-bold hover:bg-school-green-200 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download Sample CSV
        </button>
      </div>
      <p className="text-gray-600 mb-6 font-medium">
        Required columns: <code className="bg-gray-100 px-2 py-1 rounded">surname, other_names, staff_id, department, gender, title, position_rank</code>
      </p>

      {!results ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <span className="text-3xl mb-2 text-gray-400">📄</span>
                <p className="mb-2 text-sm text-gray-500 font-medium">{file ? file.name : "Click to upload CSV teacher list"}</p>
              </div>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} disabled={uploading} title="teacher list csv file"/>
            </label>
          </div>
          {preview.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-bold text-gray-700 mb-2">Data Preview (first 5 rows):</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left text-gray-500">
                  <thead className="bg-gray-50"><tr>{Object.keys(preview[0]).map(h => <th key={h} className="px-2 py-1 font-bold">{h}</th>)}</tr></thead>
                  <tbody>{preview.map((row, i) => (<tr key={i} className="border-t">{Object.values(row).map((v: any, j) => <td key={j} className="px-2 py-1">{v}</td>)}</tr>))}</tbody>
                </table>
              </div>
            </div>
          )}
          <button onClick={handleUpload} disabled={!file || uploading} className="w-full bg-school-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-school-green-700 transition-all disabled:opacity-50">
            {uploading ? 'Processing...' : 'Upload & Generate IDs'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800 font-bold text-lg">{results.length} teachers imported successfully</p>
          </div>
          <div className="max-h-60 overflow-y-auto border rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50"><tr><th className="px-3 py-2 font-bold">#</th><th className="px-3 py-2 font-bold">Name</th><th className="px-3 py-2 font-bold">Teacher ID</th><th className="px-3 py-2 font-bold">Staff ID</th><th className="px-3 py-2 font-bold">Password</th></tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.teacherId}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.staffId}</td>
                    <td className="px-3 py-2 font-mono text-xs text-amber-600">{r.tempPassword}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <button onClick={downloadCredentials} className="flex-1 bg-school-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-school-green-700 transition-all">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Credentials CSV
              </span>
            </button>
            <button onClick={() => { setResults(null); setPreview([]); setFile(null); }} className="px-6 py-3 border rounded-xl font-bold hover:bg-gray-50 transition-all">
              Upload More
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
