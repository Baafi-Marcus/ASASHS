import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';

export function AdminExamReports() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<{title: string, dueDate: string} | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await db.getGeneralExams();
      
      // Group by title and due_date
      const grouped = data.reduce((acc: any, curr: any) => {
        const key = `${curr.title}_${curr.due_date}`;
        if (!acc[key]) {
          acc[key] = {
            title: curr.title,
            due_date: curr.due_date,
            exam_type: curr.exam_type,
            subject_name: curr.subject_name,
            has_obj: curr.has_obj,
            has_theory: curr.has_theory,
            classCount: 1
          };
        } else {
          acc[key].classCount += 1;
        }
        return acc;
      }, {});
      
      setExams(Object.values(grouped));
    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (title: string, dueDate: string) => {
    try {
      setReportsLoading(true);
      setSelectedExam({ title, dueDate });
      const data = await db.getExamReports(title, dueDate);
      setReports(data || []);
    } catch (error) {
      toast.error('Failed to load reports for this exam');
    } finally {
      setReportsLoading(false);
    }
  };

  // Calculate Averages
  const objAverage = reports.length > 0 
    ? (reports.reduce((acc, r) => acc + (Number(r.obj_score) || 0), 0) / reports.length).toFixed(1)
    : 0;
    
  const theoryAverage = reports.length > 0 
    ? (reports.reduce((acc, r) => acc + (Number(r.theory_score) || 0), 0) / reports.length).toFixed(1)
    : 0;

  const totalAverage = reports.length > 0 
    ? (reports.reduce((acc, r) => acc + (Number(r.score) || 0), 0) / reports.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {!selectedExam ? (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6">School Exam Reports</h2>
          {loading ? (
            <p>Loading exams...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam, i) => (
                <div key={i} className="bg-gray-50 border rounded-2xl p-6 hover:shadow-md transition cursor-pointer" onClick={() => fetchReports(exam.title, exam.due_date)}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">{exam.exam_type}</span>
                    <span className="text-xs font-medium text-gray-500">{new Date(exam.due_date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{exam.title}</h3>
                  <p className="text-sm font-medium text-gray-600 mb-4">{exam.subject_name}</p>
                  
                  <div className="flex gap-2 mb-4">
                    {exam.has_obj && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">OBJ</span>}
                    {exam.has_theory && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">Theory</span>}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Participating Classes: <span className="font-bold text-gray-900">{exam.classCount}</span></span>
                  </div>
                </div>
              ))}
              {exams.length === 0 && <p className="text-gray-500 col-span-3">No exams found.</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-6">
            <button onClick={() => setSelectedExam(null)} className="mr-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold">{selectedExam.title} - Detailed Report</h2>
              <p className="text-gray-500">Due: {new Date(selectedExam.dueDate).toLocaleString()}</p>
            </div>
          </div>

          {reportsLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-school-green-600"></div>
            </div>
          ) : (
            <>
              {/* Analytics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-school-green-50 to-school-green-100 p-4 rounded-2xl border border-school-green-200">
                  <p className="text-sm text-school-green-800 font-bold uppercase">Total Submissions</p>
                  <p className="text-3xl font-black text-school-green-900">{reports.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border">
                  <p className="text-sm text-gray-500 font-bold uppercase">Average OBJ Score</p>
                  <p className="text-3xl font-black text-gray-800">{objAverage}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border">
                  <p className="text-sm text-gray-500 font-bold uppercase">Average Theory Score</p>
                  <p className="text-3xl font-black text-gray-800">{theoryAverage}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                  <p className="text-sm text-gray-300 font-bold uppercase">Average Total Score</p>
                  <p className="text-3xl font-black text-white">{totalAverage}</p>
                </div>
              </div>

              {/* Individual Student Scores */}
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 font-bold text-gray-700">Admission No.</th>
                      <th className="px-4 py-3 font-bold text-gray-700">Student Name</th>
                      <th className="px-4 py-3 font-bold text-gray-700">Class</th>
                      <th className="px-4 py-3 font-bold text-gray-700">OBJ Score</th>
                      <th className="px-4 py-3 font-bold text-gray-700">Theory Score</th>
                      <th className="px-4 py-3 font-bold text-school-green-700">Total Score</th>
                      <th className="px-4 py-3 font-bold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-mono text-sm">{r.admission_number}</td>
                        <td className="px-4 py-3 font-medium">{r.surname}, {r.other_names}</td>
                        <td className="px-4 py-3">{r.class_name}</td>
                        <td className="px-4 py-3">{r.obj_score !== null ? r.obj_score : '-'}</td>
                        <td className="px-4 py-3">{r.theory_score !== null ? r.theory_score : '-'}</td>
                        <td className="px-4 py-3 font-bold text-school-green-700">{r.score !== null ? r.score : '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${r.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {r.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                          No submissions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
