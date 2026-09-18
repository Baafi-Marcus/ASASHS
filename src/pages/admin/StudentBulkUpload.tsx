import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';

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
        toast.error('Please upload a valid CSV file');
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
    <PortalCard
      title="Bulk Student Upload"
      subtitle="Import multiple students via formatted CSV spreadsheet"
      headerActions={
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-sm text-xs font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CSV Template
        </button>
      }
    >
      <div className="space-y-5">
        {/* Guidance Instructions */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-sm p-3.5 text-xs text-amber-900 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-amber-950 mb-1">
            <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Column Specifications:
          </div>
          <div>
            <span className="font-medium text-amber-800">Required: </span>
            <code className="font-mono bg-white/80 px-1 py-0.5 rounded-xs border border-amber-200">surname, other_names, programme, class</code>
          </div>
          <div className="mt-1">
            <span className="font-medium text-amber-800">Optional: </span>
            <code className="font-mono bg-white/80 px-1 py-0.5 rounded-xs border border-amber-200">admission_number, date_of_birth, gender, form</code>
          </div>
          <p className="mt-1.5 text-amber-700 text-[11px]">
            Leave admission_number blank to automatically generate institutional IDs. Use exact class codes (e.g. 1A1, 2B2) and full programme names.
          </p>
        </div>

        {!results ? (
          <div className="space-y-4">
            {/* Upload Drop Area */}
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-sm cursor-pointer bg-gray-50/60 hover:bg-gray-100/70 hover:border-gray-400 transition-all">
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  {file ? file.name : 'Click to select CSV roster file'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Maximum 1,000 student records per file batch</p>
              </div>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} disabled={uploading} title="student list csv file" />
            </label>

            {/* Preview Section */}
            {preview.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600">CSV Sample Preview (First 5 Rows)</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-sm">
                  <table className="min-w-full text-xs text-left text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                      <tr>
                        {Object.keys(preview[0]).map((h) => (
                          <th key={h} className="px-3 py-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {preview.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {Object.values(row).map((v: any, j) => (
                            <td key={j} className="px-3 py-2">{v || '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <PortalButton
              onClick={handleUpload}
              disabled={!file || uploading}
              variant="primary"
              className="w-full justify-center"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing and Generating Credentials...
                </span>
              ) : (
                'Upload & Generate Student Accounts'
              )}
            </PortalButton>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-emerald-900 font-bold text-sm">Upload Successful</p>
                <p className="text-emerald-700 text-xs mt-0.5 tabular-nums">{results.length} student accounts provisioned</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 font-semibold text-gray-700">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Full Name</th>
                    <th className="px-3 py-2">Student ID</th>
                    <th className="px-3 py-2">Admission No</th>
                    <th className="px-3 py-2">Initial Password</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 tabular-nums">
                      <td className="px-3 py-2 text-gray-400 font-sans">{i + 1}</td>
                      <td className="px-3 py-2 font-sans font-medium text-gray-800">{r.name}</td>
                      <td className="px-3 py-2 text-gray-700 font-semibold">{r.studentId}</td>
                      <td className="px-3 py-2 text-gray-500">{r.admissionNum}</td>
                      <td className="px-3 py-2 text-school-green-700 font-bold">{r.tempPassword}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 pt-2">
              <PortalButton
                onClick={downloadCredentials}
                variant="primary"
                className="flex-1 justify-center"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Credentials CSV
              </PortalButton>
              <PortalButton
                onClick={() => { setResults(null); setPreview([]); setFile(null); }}
                variant="secondary"
              >
                Upload Another File
              </PortalButton>
            </div>
          </div>
        )}
      </div>
    </PortalCard>
  );
};
