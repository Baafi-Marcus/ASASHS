import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { parseDate, getScheduleStatus } from '../../lib/dates';
import { useNativeSecurity } from '../../components/NativeSecurityProvider';
import { ScientificCalculator, PeriodicTable } from '../../components/assessments/ResourceLibraries';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';

export function LegacyExamRunner({ studentId, exam, onClose }: { studentId: number, exam: any, onClose: () => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);
  const [readerZoom, setReaderZoom] = useState(1);
  const { startLockdown, stopLockdown } = useNativeSecurity();
  const handleSubmitRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    startLockdown(() => {
      toast.error('Auto-submitting exam due to maximum security violations!');
      handleSubmitRef.current();
    });
    return () => {
      stopLockdown();
    };
  }, []);

  // Schedule check
  if (exam.due_date) {
    const status = getScheduleStatus(exam.due_date, exam.duration_minutes);
    const startTime = parseDate(exam.due_date);
    const durationMs = (exam.duration_minutes || 60) * 60 * 1000;
    const endTime = startTime ? startTime.getTime() + durationMs : null;

    if (status === 'upcoming') {
      return (
        <PortalCard className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-center mx-auto text-blue-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">Exam Not Yet Available</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              This exam is scheduled for <span className="tabular-nums font-semibold text-gray-700">{startTime?.toLocaleString()}</span>. Please wait until the start time.
            </p>
          </div>
          <PortalButton variant="secondary" onClick={onClose}>
            Back to Exams
          </PortalButton>
        </PortalCard>
      );
    }
    if (status === 'ended' && !isSubmitted) {
      return (
        <PortalCard className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-md flex items-center justify-center mx-auto text-red-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">Exam Has Ended</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              This exam concluded on <span className="tabular-nums font-semibold text-gray-700">{endTime ? new Date(endTime).toLocaleString() : 'N/A'}</span> and is no longer accepting submissions.
            </p>
          </div>
          <PortalButton variant="secondary" onClick={onClose}>
            Back to Exams
          </PortalButton>
        </PortalCard>
      );
    }
  }

  const objQuestionsCount = exam.obj_answer_key ? exam.obj_answer_key.length : 0;
  const questions = Array.from({ length: objQuestionsCount }, (_, i) => i + 1);

  const handleSelect = (qNum: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qNum]: option }));
  };

  const handleSubmit = async () => {
    if (exam.has_obj && Object.keys(answers).length < objQuestionsCount) {
      if (!window.confirm('You have unanswered objective questions. Submit anyway?')) return;
    }
    setIsSubmitting(true);
    try {
      let objScore = 0;
      if (exam.has_obj && exam.obj_answer_key) {
        const keyArray = exam.obj_answer_key.split('');
        let correctCount = 0;
        for (let i = 0; i < keyArray.length; i++) {
          if (answers[i + 1] === keyArray[i]) correctCount++;
        }
        objScore = correctCount;
      }
      await db.submitExam({ assignment_id: exam.id, student_id: studentId, obj_score: objScore });
      toast.success('Exam submitted successfully!');
      setIsSubmitted(true);
    } catch (error) {
      toast.error('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };
  handleSubmitRef.current = handleSubmit;

  if (isSubmitted) {
    const pinNumber = ((studentId * 137 + exam.id * 89) % 9000) + 1000;
    const attendancePin = `#ASASHS-${pinNumber}-OK`;

    return (
      <div className="bg-gray-950 text-white rounded-md shadow-sm p-8 max-w-xl mx-auto my-6 text-center space-y-6 border border-gray-800 animate-fade-in">
        <div className="w-16 h-16 bg-school-green-950/80 rounded-md flex items-center justify-center mx-auto border border-school-green-700/60 text-school-green-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">EXAM SUBMITTED SUCCESSFULLY</h2>
          <p className="text-gray-400 text-sm">{exam.title} &bull; {exam.subject_name}</p>
        </div>

        <div className="bg-gray-900 p-5 rounded-md border border-gray-800 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-school-green-400">Digital Attendance PIN Code</span>
            <span className="w-2 h-2 rounded-full bg-school-green-400 animate-pulse"></span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-widest text-white py-2 border-y border-gray-800 text-center bg-black/40 rounded-sm tabular-nums">
            {attendancePin}
          </div>
          <p className="text-xs text-amber-300 leading-relaxed font-medium">
            📦 <strong>Physical Booklet Handover Required:</strong> Write your Student ID (<strong className="tabular-nums">#{studentId}</strong>) on your theory answer booklet and present this Attendance PIN to your invigilator right now for hall verification.
          </p>
        </div>

        <PortalButton
          onClick={onClose}
          variant="primary"
          className="w-full"
        >
          Return to Exams Dashboard
        </PortalButton>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[85vh]">
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center px-6 shrink-0 relative z-10 border-b border-gray-800">
        <div>
          <h2 className="text-base font-bold truncate max-w-md">{exam.title}</h2>
          <p className="text-xs text-gray-400">{exam.subject_name} &bull; {exam.exam_type}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowCalculator(!showCalculator); setShowPeriodicTable(false); }}
            className={`min-h-[36px] px-3 py-1.5 rounded-sm text-xs font-semibold transition flex items-center gap-1.5 border ${
              showCalculator
                ? 'bg-amber-500 text-gray-950 border-amber-600'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
          >
            <span>🖩 Calculator</span>
          </button>
          <button
            onClick={() => { setShowPeriodicTable(!showPeriodicTable); setShowCalculator(false); }}
            className={`min-h-[36px] px-3 py-1.5 rounded-sm text-xs font-semibold transition flex items-center gap-1.5 border ${
              showPeriodicTable
                ? 'bg-cyan-500 text-gray-950 border-cyan-600'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
          >
            <span>🧪 Periodic Table</span>
          </button>
          {exam.theory_content_url && (
            <button
              onClick={() => setReaderZoom(prev => prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1)}
              className="min-h-[36px] px-3 py-1.5 rounded-sm text-xs font-semibold bg-purple-900 text-purple-200 border border-purple-700 hover:bg-purple-800 transition tabular-nums"
            >
              <span>🔍 Zoom {Math.round(readerZoom * 100)}%</span>
            </button>
          )}
          <PortalButton
            onClick={handleSubmit}
            loading={isSubmitting}
            loadingText="Submitting..."
            variant="primary"
            className="!min-h-[36px] !py-1 text-xs"
          >
            Submit Exam
          </PortalButton>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 bg-gray-50 p-4 overflow-y-auto border-r border-gray-200 ${!exam.theory_content_url ? 'hidden' : ''}`}>
          <div className="bg-white w-full h-full rounded-md border border-gray-200 shadow-sm flex flex-col">
            <div className="p-3 border-b border-gray-200 bg-gray-50/80 rounded-t-md font-semibold text-xs text-gray-700 uppercase tracking-wider">
              Exam Paper Document
            </div>
            {exam.theory_content_url ? (
              <iframe src={exam.theory_content_url} className="w-full flex-1 rounded-b-md" title="Exam Document" />
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400">No document provided.</div>
            )}
          </div>
        </div>
        <div className={`${exam.theory_content_url ? 'w-80' : 'flex-1'} bg-white overflow-y-auto p-6 flex flex-col`}>
          {exam.has_obj ? (
            <div>
              <h3 className="font-bold text-base mb-1 text-gray-900">Objective Section</h3>
              <p className="text-xs text-gray-500 mb-6">Select the option corresponding to each question number.</p>
              {questions.length > 0 ? (
                <div className="space-y-3">
                  {questions.map((q) => (
                    <div key={q} className="flex items-center justify-between p-2 rounded-sm hover:bg-gray-50 border border-transparent hover:border-gray-100 transition">
                      <span className="font-mono font-semibold text-xs text-gray-700 w-8 tabular-nums">{q}.</span>
                      <div className="flex gap-2">
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleSelect(q, opt)}
                            className={`min-w-[36px] min-h-[36px] rounded-sm font-semibold text-xs border transition-all ${
                              answers[q] === opt
                                ? 'bg-school-green-700 border-school-green-700 text-white font-bold'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-sm text-xs">
                  Objective section is enabled, but no answer key was specified.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-purple-50/50 rounded-md border border-purple-200">
              <div className="w-12 h-12 bg-purple-900 text-white rounded-md flex items-center justify-center text-xl mb-3 shadow-sm">✍️</div>
              <h3 className="text-base font-bold text-gray-900 mb-2 uppercase tracking-wide">Theory on Paper — Secure Digital Proctor Mode</h3>
              <p className="text-gray-600 max-w-md leading-relaxed text-xs">
                Read your questions on the digital paper document. Write all solutions and draw diagrams clearly in your official physical answer booklet provided by your invigilator. Ensure your Student ID is written on all booklets before clicking "Submit Exam".
              </p>
            </div>
          )}
        </div>
      </div>

      {showCalculator && (
        <div className="fixed bottom-6 right-6 z-50">
          <ScientificCalculator onClose={() => setShowCalculator(false)} />
        </div>
      )}

      {showPeriodicTable && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <PeriodicTable onClose={() => setShowPeriodicTable(false)} />
        </div>
      )}
    </div>
  );
}
