import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';

interface StudentBulkUploadProps {
  onSuccess: () => void;
  courses: { id: number; name: string }[];
  classes: { id: number; class_name: string }[];
}

const normalizeHeader = (h: string): string => {
  const map: Record<string, string> = {
    'student id': 'student_id',
    'student no': 'student_id',
    'student no.': 'student_id',
    'student number': 'student_id',
    'admission number': 'admission_number',
    'admission no': 'admission_number',
    'admission no.': 'admission_number',
    'date of birth': 'date_of_birth',
    'birth date': 'date_of_birth',
    'dob': 'date_of_birth',
    'other names': 'other_names',
    'given names': 'other_names',
    'first name': 'other_names',
    'last name': 'surname',
    'academic year': 'academic_year',
    'academic session': 'academic_year',
    'session': 'academic_year',
    'programme': 'programme',
    'program': 'programme',
    'course': 'programme',
    'current class': 'class',
    'form class': 'class',
  };
  const key = h.toLowerCase().trim();
  // Replace whitespace with single space, then check map
  const normalized = key.replace(/\s+/g, ' ');
  return map[normalized] || key;
};

export const StudentBulkUpload: React.FC<StudentBulkUploadProps> = ({ onSuccess, courses, classes }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [results, setResults] = useState<any[] | null>(null);

  const downloadTemplate = () => {
    const headers = ['admission_number', 'surname', 'other_names', 'date_of_birth', 'gender', 'form', 'programme', 'class'];
    const sampleRows = [
      ['', 'Asare', 'Kwame', '2005-03-15', 'Male', '1', 'General Science', '1A1'],
      ['ASA2025001', 'Mensah', 'Akua', '2006-07-22', 'Female', '2', 'Business', '2B2'],
      ['', 'Owusu', 'Yaa', '2005-11-08', 'Female', '1', 'General Arts', '1A3'],
    ];
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + sampleRows.map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "student_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
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
      const rawHeaders = lines[0].split(',').map(h => h.trim());
      const headers = rawHeaders.map(h => normalizeHeader(h));
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
        const rawHeaders = lines[0].split(',').map(h => h.trim());
        const headers = rawHeaders.map(h => normalizeHeader(h));
        const studentsToImport = lines.slice(1).filter(line => line.trim() !== '').map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, i) => { obj[header] = values[i]; });
          const classMatch = classes.find(c => c.class_name.toLowerCase() === obj.class?.toLowerCase());
          const courseMatch = courses.find(c => c.name.toLowerCase() === obj.programme?.toLowerCase());
          if (!classMatch) throw new Error(`Class not found in row: ${line}. Use an exact class name like 1A1, 2B2.`);
          if (!courseMatch) throw new Error(`Programme not found in row: ${line}. Use an exact programme name like General Science, Business.`);
          return {
            surname: obj.surname || obj.lastname || '',
            other_names: obj.other_names || obj.firstname || '',
            class_id: classMatch.id,
            course_id: courseMatch.id,
            admission_number: obj.student_id || obj.admission_number || '',
            date_of_birth: obj.date_of_birth || obj.dob || '',
            gender: obj.gender || '',
          };
        });
        const imported = await db.bulkImportStudents(studentsToImport);
        toast.success(`Successfully imported ${imported.length} students`);
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
    const headers = ['Name', 'Student ID', 'Admission Number', 'Temporary Password'];
    const rows = results.map(r => [r.name, r.studentId, r.admissionNum, r.tempPassword]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `student_credentials_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-school-cream-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">Bulk Student Upload</h3>
        <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-1.5 bg-school-green-100 text-school-green-700 rounded-lg text-xs font-bold hover:bg-school-green-200 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download Sample CSV
        </button>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
        <p className="font-bold mb-1">Required columns:</p>
        <code className="text-xs">surname, other_names, programme, class</code>
        <p className="font-bold mt-2 mb-1">Optional columns:</p>
        <code className="text-xs">admission_number, date_of_birth, gender, form</code>
        <p className="text-xs mt-1">Leave <strong>admission_number</strong> blank to auto-generate. Use <strong>programme</strong> (not course) column. Use exact class names (e.g. 1A1, 2B2) and programme names (e.g. General Science, Business).</p>
      </div>

      {!results ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <span className="text-3xl mb-2 text-gray-400">📄</span>
                <p className="mb-2 text-sm text-gray-500 font-medium">{file ? file.name : "Click to upload CSV student list"}</p>
              </div>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} disabled={uploading} title="student list csv file"/>
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
            <p className="text-green-800 font-bold text-lg">{results.length} students imported successfully</p>
          </div>
          <div className="max-h-60 overflow-y-auto border rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50"><tr><th className="px-3 py-2 font-bold">#</th><th className="px-3 py-2 font-bold">Name</th><th className="px-3 py-2 font-bold">Student ID</th><th className="px-3 py-2 font-bold">Admission No.</th><th className="px-3 py-2 font-bold">Password</th></tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.studentId}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.admissionNum}</td>
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
