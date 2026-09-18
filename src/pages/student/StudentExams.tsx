import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { ExamRunner } from './ExamRunner';
import { getScheduleStatus, getStatusColor } from '../../lib/dates';
import { syncEngine } from '../../services/syncEngine';
import { SkeletonGrid } from '../../components/SkeletonLoader';

function getExamStatus(exam: any): { label: string; color: string; ended: boolean } {
  const status = getScheduleStatus(exam.due_date, exam.duration_minutes);
  const ended = status === 'ended';
  if (status === 'unscheduled') return { label: 'Active', color: 'text-emerald-800 bg-emerald-50 border-emerald-200', ended: false };
  if (status === 'upcoming') return { label: 'Upcoming', color: 'text-blue-800 bg-blue-50 border-blue-200', ended: false };
  if (status === 'ended') return { label: 'Closed', color: 'text-gray-600 bg-gray-100 border-gray-200', ended: true };
  return { label: 'Active', color: 'text-emerald-800 bg-emerald-50 border-emerald-200', ended: false };
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-md border border-gray-200">
        <div>
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">Official School Examinations</h2>
          <p className="text-xs text-gray-500 mt-0.5">End of Semester, Mid-Semester, and Standardized Class Tests</p>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={3} columns={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => {
            const status = getExamStatus(exam);
            return (
              <div 
                key={exam.id} 
                className={`bg-white rounded-md border border-gray-200 p-5 flex flex-col justify-between transition-all duration-fast ease-standard hover:-translate-y-0.5 ${
                  status.ended ? 'opacity-70 bg-gray-50/60' : ''
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-sm border border-gray-200 uppercase">
                      {exam.exam_type || 'Examination'}
                    </span>
                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-sm border ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-sm text-gray-900 mb-1 leading-snug">{exam.title}</h4>
                  <p className="text-xs font-semibold text-school-green-800 mb-3">{exam.subject_name}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                    {exam.has_obj && (
                      <span className="px-2 py-0.5 bg-gray-50 text-gray-700 rounded-sm border border-gray-200">
                        Section A: Objectives
                      </span>
                    )}
                    {exam.has_theory && (
                      <span className="px-2 py-0.5 bg-gray-50 text-gray-700 rounded-sm border border-gray-200">
                        Section B: Theory
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <PortalButton 
                    onClick={() => setSelectedExam(exam)}
                    variant="primary"
                    size="sm"
                    fullWidth
                    disabled={status.ended}
                  >
                    {status.ended ? 'Exam Concluded' : 'Enter Examination'}
                  </PortalButton>
                  
                  {exam.quiz_id && exam.allow_offline !== false && !status.ended && (
                    <button
                      onClick={async () => {
                        try {
                          await syncEngine.checkOutAssessment(studentId, exam.quiz_id);
                          toast.success('Downloaded to offline storage');
                        } catch (e) {
                          toast.error('Could not download for offline');
                        }
                      }}
                      className="w-full min-h-[36px] text-xs font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-sm transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-school-green-700"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Save for Offline</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {exams.length === 0 && (
            <div className="col-span-full p-8 text-center bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-500">
              No official school examinations scheduled for your class at this time.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
