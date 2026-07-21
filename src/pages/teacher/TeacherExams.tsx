import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { getStatusLabel, getStatusColor } from '../../lib/dates';
import { TeacherInvigilatorDashboard } from '../../components/teacher/TeacherInvigilatorDashboard';
import { OfficialCAScoreSheetModal } from '../../components/teacher/OfficialCAScoreSheetModal';

export function TeacherExams({ teacherId }: { teacherId: number }) {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [radarExam, setRadarExam] = useState<any>(null);
  const [showCaSheetModal, setShowCaSheetModal] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [saving, setSaving] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchExams();
  }, [teacherId]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      // Find all general exams targeting the classes this teacher teaches
      const data = await db.getTeacherGeneralExams(teacherId);
      setExams(data || []);
    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (exam: any) => {
    setSelectedExam(exam);
    setSubmissionsLoading(true);
    try {
      const data = await db.getExamSubmissionsByAssignment(exam.id);
      setSubmissions(data || []);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const updateTheoryScore = async (submissionId: number | null, studentId: number, scoreStr: string) => {
    const score = Number(scoreStr);
    if (isNaN(score)) return;

    setSaving(prev => ({ ...prev, [studentId]: true }));
    try {
      await db.updateExamTheoryScore(selectedExam.id, studentId, submissionId, score);
      toast.success('Score saved');
      // Update local state without refetching completely to prevent focus loss
      setSubmissions(prev => prev.map(sub => {
        if (sub.student_id === studentId) {
          return {
            ...sub,
            theory_score: score,
            score: (Number(sub.obj_score) || 0) + score,
            status: 'graded'
          };
        }
        return sub;
      }));
    } catch (error) {
      toast.error('Failed to save score');
    } finally {
      setSaving(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) {
      toast.error('No submissions to export');
      return;
    }
    const headers = ['Student ID', 'Surname', 'Other Names', 'OBJ Score', 'Theory Score', 'Total Exam Score'];
    const rows = submissions.map(sub => [
      sub.student_admission_number || sub.student_id,
      `"${sub.surname}"`,
      `"${sub.other_names}"`,
      sub.obj_score !== null ? sub.obj_score : '',
      sub.theory_score !== null ? sub.theory_score : '',
      sub.score !== null ? sub.score : ''
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedExam.title.replace(/\s+/g, '_')}_Results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (selectedExam) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <button onClick={() => setSelectedExam(null)} className="mr-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{selectedExam.title} - Theory Grading</h2>
            <p className="text-gray-500">{selectedExam.class_name} • {selectedExam.subject_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setRadarExam(selectedExam)}
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-bold text-sm shadow"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2"></span>
              📡 Live Radar
            </button>
            <button
              onClick={() => setShowCaSheetModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm shadow transition"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              📄 Official CA Sheet (with OBJ)
            </button>
            <button 
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 font-bold text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Admin Continuous Assessment (CA) Policy & Template Banner */}
        {(selectedExam.ca_pdf_url || selectedExam.ca_instructions || selectedExam.ca_weight_obj) && (
          <div className="mb-6 p-4 bg-blue-50/90 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-blue-900 flex items-center gap-1.5">
                  <span>🏛️</span> Admin Continuous Assessment Policy
                </span>
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">OBJ Weight: {selectedExam.ca_weight_obj || 40}%</span>
                <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold">Theory Weight: {selectedExam.ca_weight_theory || 60}%</span>
              </div>
              <p className="text-xs text-blue-800 font-medium">
                {selectedExam.ca_instructions || "Download the official CA score sheet below with auto-graded OBJ results to write and enter your manual Theory marks."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedExam.ca_pdf_url && (
                <a
                  href={selectedExam.ca_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white text-blue-700 border border-blue-300 rounded-xl text-xs font-bold hover:bg-blue-100 transition flex items-center gap-1.5 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span>View Admin CA Template PDF</span>
                </a>
              )}
              <button
                onClick={() => setShowCaSheetModal(true)}
                className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5"
              >
                <span>📄 Generate CA Score Sheet</span>
              </button>
            </div>
          </div>
        )}

        {submissionsLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-school-green-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 font-bold text-gray-700">Student Name</th>
                  <th className="px-4 py-3 font-bold text-gray-700">OBJ Score (Auto)</th>
                  <th className="px-4 py-3 font-bold text-school-green-700">Theory Score (Manual)</th>
                  <th className="px-4 py-3 font-bold text-gray-700">Total Score</th>
                  <th className="px-4 py-3 font-bold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{sub.surname}, {sub.other_names}</td>
                    <td className="px-4 py-3 text-gray-600">{sub.obj_score !== null ? sub.obj_score : (sub.score !== null ? 'Auto' : 'N/A')}</td>
                    <td className="px-4 py-3">
                      {sub.obj_score === null && sub.score !== null ? (
                        <span className="text-green-600 text-sm font-medium">N/A (Quiz-based)</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            defaultValue={sub.theory_score !== null ? sub.theory_score : ''}
                            onBlur={(e) => updateTheoryScore(sub.submission_id, sub.student_id, e.target.value)}
                            className="w-24 px-3 py-1 border rounded-lg focus:ring-2 focus:ring-school-green-500"
                            placeholder="Score"
                          />
                          {saving[sub.student_id] && <span className="text-xs text-blue-500">Saving...</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold">{sub.score !== null ? sub.score : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${sub.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {sub.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      No students found in this class.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-2">School Exams Grading</h2>
        <p className="text-gray-600 mb-6">Enter Theory scores for End of Semester and Mid-Semester exams distributed by Admins.</p>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-school-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam, i) => (
              <div key={i} className="bg-gray-50 border rounded-2xl p-6 hover:shadow-md transition cursor-pointer" onClick={() => fetchSubmissions(exam)}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">{exam.exam_type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(exam.due_date, exam.duration_minutes)}`}>{getStatusLabel(exam.due_date, exam.duration_minutes)}</span>
                  </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{exam.title}</h3>
                <p className="text-sm font-medium text-gray-600 mb-1">{exam.class_name}</p>
                <p className="text-sm text-gray-500 mb-4">{exam.subject_name}</p>
                
                <div className="flex gap-2 mb-4">
                  {exam.has_obj && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">OBJ</span>}
                  {exam.has_theory && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">Theory</span>}
                </div>
                <div className="pt-3 border-t flex justify-between items-center mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setRadarExam(exam); }}
                    className="w-full px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition shadow"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span>📡 Live Invigilator Radar</span>
                  </button>
                </div>
              </div>
            ))}
            {exams.length === 0 && <p className="text-gray-500 col-span-3">No general exams found for your classes.</p>}
          </div>
        )}
      </div>

      <TeacherInvigilatorDashboard
        isOpen={!!radarExam}
        onClose={() => setRadarExam(null)}
        assessment={radarExam}
      />

      <OfficialCAScoreSheetModal
        isOpen={showCaSheetModal}
        onClose={() => setShowCaSheetModal(false)}
        exam={selectedExam}
        submissions={submissions}
      />
    </div>
  );
}
