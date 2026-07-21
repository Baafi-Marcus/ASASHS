import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { ExamRunner } from './ExamRunner';
import { getScheduleStatus, getStatusColor } from '../../lib/dates';
import { syncEngine } from '../../services/syncEngine';

function getExamStatus(exam: any): { label: string; color: string; ended: boolean } {
  const status = getScheduleStatus(exam.due_date, exam.duration_minutes);
  const color = getStatusColor(exam.due_date, exam.duration_minutes);
  const ended = status === 'ended';
  if (status === 'unscheduled') return { label: 'Active', color: 'text-green-600 bg-green-50', ended: false };
  if (status === 'upcoming') return { label: 'Upcoming', color, ended: false };
  if (status === 'ended') return { label: 'Ended', color, ended: true };
  return { label: 'Active', color, ended: false };
}

export function StudentExams({ studentId, classId }: { studentId: number; classId: number }) {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await db.getStudentExams(classId);
      setExams(data || []);
    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  if (selectedExam) {
    return (
      <ExamRunner 
        studentId={studentId} 
        exam={selectedExam} 
        onClose={() => {
          setSelectedExam(null);
          fetchData();
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">School Exams</h2>
          <p className="text-gray-600">Official End of Semester, Mid-Sem, and Intervention Exams</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <PortalCard key={exam.id} className={`group hover:border-school-green-300 transition-colors ${getExamStatus(exam).ended ? 'opacity-70' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full uppercase">
                  {exam.exam_type}
                </span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${getExamStatus(exam).color}`}>
                  {getExamStatus(exam).label}
                </span>
              </div>
              
              <h4 className="font-bold text-gray-900 mb-2">{exam.title}</h4>
              <p className="text-sm font-medium text-school-green-700 mb-4">{exam.subject_name}</p>
              
              <div className="flex gap-2 mb-6">
                {exam.has_obj && <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200">OBJ Included</span>}
                {exam.has_theory && <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-200">Theory Included</span>}
              </div>
              
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <PortalButton 
                  onClick={() => setSelectedExam(exam)}
                  className="w-full"
                  disabled={getExamStatus(exam).ended}
                >
                  {getExamStatus(exam).ended ? 'Exam Ended' : 'Enter Exam Portal'}
                </PortalButton>
                {exam.quiz_id && exam.allow_offline !== false && !getExamStatus(exam).ended && (
                  <button
                    onClick={async () => {
                      try {
                        await syncEngine.checkOutAssessment(studentId, exam.quiz_id);
                      } catch (e) {}
                    }}
                    className="w-full text-xs font-bold text-school-green-700 bg-school-green-50 hover:bg-school-green-100 border border-school-green-200 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>📥 Check-Out to APK Vault</span>
                  </button>
                )}
              </div>
            </PortalCard>
          ))}
          {exams.length === 0 && (
            <div className="col-span-3 p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">No official school exams scheduled for your class.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
