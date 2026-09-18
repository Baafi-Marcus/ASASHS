import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { getStatusLabel, getStatusColor } from '../../lib/dates';
import { TeacherInvigilatorDashboard } from '../../components/teacher/TeacherInvigilatorDashboard';
import { OfficialCAScoreSheetModal } from '../../components/teacher/OfficialCAScoreSheetModal';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';

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
      toast.success('Theory score saved');
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
      <div className="space-y-6">
        <PortalCard className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setSelectedExam(null)} 
                className="p-2 rounded-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedExam.title} — Theory Scoring</h2>
                <p className="text-xs text-gray-500">{selectedExam.class_name} • {selectedExam.subject_name}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PortalButton 
                onClick={() => setRadarExam(selectedExam)}
                variant="secondary"
                className="text-xs !min-h-[36px] !py-1 !bg-gray-900 !text-white !border-gray-900 hover:!bg-black"
              >
                <span className="w-2 h-2 rounded-full bg-school-green-400 animate-pulse mr-1.5"></span>
                Live Radar
              </PortalButton>
              <PortalButton
                onClick={() => setShowCaSheetModal(true)}
                variant="secondary"
                className="text-xs !min-h-[36px] !py-1"
              >
                Official CA Sheet
              </PortalButton>
              <PortalButton 
                onClick={handleExportCSV}
                variant="secondary"
                className="text-xs !min-h-[36px] !py-1"
              >
                Export CSV
              </PortalButton>
            </div>
          </div>

          {/* Admin Continuous Assessment (CA) Policy Banner */}
          {(selectedExam.ca_pdf_url || selectedExam.ca_instructions || selectedExam.ca_weight_obj) && (
            <div className="mb-6 p-4 bg-blue-50/70 border border-blue-200 rounded-sm flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-blue-950 tracking-wider">
                    Official CA Weighting Policy
                  </span>
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-sm text-[10px] font-semibold tabular-nums">
                    OBJ: {selectedExam.ca_weight_obj || 40}%
                  </span>
                  <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-sm text-[10px] font-semibold tabular-nums">
                    Theory: {selectedExam.ca_weight_theory || 60}%
                  </span>
                </div>
                <p className="text-xs text-blue-900">
                  {selectedExam.ca_instructions || "Download the official CA score sheet with autograded OBJ scores to enter physical booklet Theory marks."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedExam.ca_pdf_url && (
                  <a
                    href={selectedExam.ca_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[32px] px-3 py-1 bg-white text-blue-800 border border-blue-300 rounded-sm text-xs font-medium hover:bg-blue-50 transition flex items-center gap-1.5"
                  >
                    <span>View Admin Sheet PDF</span>
                  </a>
                )}
                <PortalButton
                  onClick={() => setShowCaSheetModal(true)}
                  variant="primary"
                  className="text-xs !min-h-[32px] !py-1"
                >
                  Generate CA Sheet
                </PortalButton>
              </div>
            </div>
          )}

          {submissionsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-school-green-200 border-t-school-green-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-sm border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">OBJ Score (Auto)</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Theory Score (Manual)</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Total Score</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map((sub, i) => (
                    <tr key={i} className="hover:bg-gray-50/60 transition">
                      <td className="px-4 py-3 text-xs font-bold text-gray-900">{sub.surname}, {sub.other_names}</td>
                      <td className="px-4 py-3 text-xs font-mono tabular-nums text-gray-600 text-right">
                        {sub.obj_score !== null ? sub.obj_score : (sub.score !== null ? 'Auto' : '-')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {sub.obj_score === null && sub.score !== null ? (
                          <span className="text-school-green-700 text-xs font-semibold">Auto-graded</span>
                        ) : (
                          <div className="inline-flex items-center gap-2 justify-end">
                            <input 
                              type="number"
                              defaultValue={sub.theory_score !== null ? sub.theory_score : ''}
                              onBlur={(e) => updateTheoryScore(sub.submission_id, sub.student_id, e.target.value)}
                              className="w-20 px-2 py-1 bg-white border border-gray-300 rounded-sm text-right text-xs font-mono tabular-nums font-semibold focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 outline-none"
                              placeholder="0.0"
                            />
                            {saving[sub.student_id] && <span className="text-[10px] text-blue-600">Saving...</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-xs text-gray-900 tabular-nums">
                        {sub.score !== null ? sub.score : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-sm border uppercase tracking-wider ${
                          sub.status === 'graded' 
                            ? 'bg-school-green-50 text-school-green-800 border-school-green-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {sub.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-xs text-gray-500">
                        No students found for this assessment session.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </PortalCard>

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

  return (
    <div className="space-y-6">
      <PortalCard className="p-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Institutional Examination Proctoring</h2>
          <p className="text-xs text-gray-500">
            Monitor real-time student activity and record paper theory scores for end-of-semester school exams.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-school-green-200 border-t-school-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam, i) => (
              <PortalCard 
                key={i} 
                className="p-5 cursor-pointer hover:border-gray-300 transition flex flex-col justify-between"
                onClick={() => fetchSubmissions(exam)}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                      {exam.exam_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border ${getStatusColor(exam.due_date, exam.duration_minutes)}`}>
                      {getStatusLabel(exam.due_date, exam.duration_minutes)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{exam.title}</h3>
                  <p className="text-xs font-medium text-gray-700">{exam.class_name}</p>
                  <p className="text-xs text-gray-500 mb-3">{exam.subject_name}</p>
                  
                  <div className="flex gap-1.5 mb-4">
                    {exam.has_obj && (
                      <span className="px-1.5 py-0.5 bg-school-green-50 text-school-green-800 border border-school-green-200 rounded-sm text-[10px] font-semibold">
                        OBJ Section
                      </span>
                    )}
                    {exam.has_theory && (
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-sm text-[10px] font-semibold">
                        Theory Section
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex gap-2">
                  <PortalButton
                    variant="secondary"
                    onClick={(e) => { e.stopPropagation(); setRadarExam(exam); }}
                    className="w-full text-xs !min-h-[36px] !py-1 !bg-gray-900 !text-white !border-gray-900 hover:!bg-black"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-school-green-400 animate-pulse mr-1.5"></span>
                    Live Radar
                  </PortalButton>
                  <PortalButton
                    variant="primary"
                    onClick={() => fetchSubmissions(exam)}
                    className="w-full text-xs !min-h-[36px] !py-1"
                  >
                    Enter Scores
                  </PortalButton>
                </div>
              </PortalCard>
            ))}
            {exams.length === 0 && (
              <p className="text-xs text-gray-500 col-span-3 py-6 text-center">
                No active school examination sessions found for your classes.
              </p>
            )}
          </div>
        )}
      </PortalCard>

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
