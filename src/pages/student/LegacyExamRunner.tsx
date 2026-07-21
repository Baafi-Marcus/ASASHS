import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { parseDate, getScheduleStatus } from '../../lib/dates';
import { useNativeSecurity } from '../../components/NativeSecurityProvider';
import { ScientificCalculator, PeriodicTable } from '../../components/assessments/ResourceLibraries';

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
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Not Yet Available</h2>
          <p className="text-gray-500 max-w-md mx-auto">This exam starts at {startTime?.toLocaleString()} and is not available yet.</p>
          <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition">Back</button>
        </div>
      );
    }
    if (status === 'ended' && !isSubmitted) {
      return (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Has Ended</h2>
          <p className="text-gray-500 max-w-md mx-auto">This exam ended at {endTime ? new Date(endTime).toLocaleString() : 'N/A'} and is no longer available.</p>
          <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition">Back</button>
        </div>
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
      <div className="bg-gray-950 text-white rounded-3xl shadow-2xl p-8 max-w-xl mx-auto my-6 text-center space-y-6 border border-gray-800 animate-fade-in">
        <div className="w-20 h-20 bg-school-green-500/20 rounded-full flex items-center justify-center mx-auto border border-school-green-500">
          <svg className="w-10 h-10 text-school-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-wide">EXAM SUBMITTED SUCCESSFULLY</h2>
          <p className="text-gray-400 text-sm">{exam.title} &bull; {exam.subject_name}</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-school-green-400">Digital Attendance PIN Code</span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
          </div>
          <div className="text-3xl font-black font-mono tracking-widest text-white py-2 border-y border-gray-800 text-center bg-black/40 rounded-xl">
            {attendancePin}
          </div>
          <p className="text-xs text-amber-300 leading-relaxed font-medium">
            📦 <strong>Physical Booklet Handover Required:</strong> Write your Student ID (<strong>#{studentId}</strong>) on your theory answer booklet and present this Attendance PIN to your invigilator right now for hall verification.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-school-green-600 hover:bg-school-green-500 text-white font-black text-sm rounded-2xl transition shadow-lg"
        >
          Return to Exams Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[85vh]">
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center px-6 shrink-0 relative z-10">
        <div>
          <h2 className="text-xl font-bold">{exam.title}</h2>
          <p className="text-sm text-gray-400">{exam.subject_name} &bull; {exam.exam_type}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowCalculator(!showCalculator); setShowPeriodicTable(false); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${showCalculator ? 'bg-amber-500 text-gray-900 shadow' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            <span>🖩 Calculator</span>
          </button>
          <button onClick={() => { setShowPeriodicTable(!showPeriodicTable); setShowCalculator(false); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${showPeriodicTable ? 'bg-cyan-500 text-gray-900 shadow' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            <span>🧪 Periodic Table</span>
          </button>
          {exam.theory_content_url && (
            <button onClick={() => setReaderZoom(prev => prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1)} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-900/80 text-purple-200 hover:bg-purple-800 transition">
              <span>🔍 Zoom {Math.round(readerZoom * 100)}%</span>
            </button>
          )}
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-school-green-500 hover:bg-school-green-400 text-white font-bold rounded-xl transition">
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 bg-gray-100 p-4 overflow-y-auto border-r ${!exam.theory_content_url ? 'hidden' : ''}`}>
          <div className="bg-white w-full h-full rounded-xl shadow-sm flex flex-col">
            <div className="p-3 border-b bg-gray-50 rounded-t-xl font-bold text-gray-700">Exam Paper Document</div>
            {exam.theory_content_url ? (
              <iframe src={exam.theory_content_url} className="w-full flex-1 rounded-b-xl" title="Exam Document" />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">No document provided.</div>
            )}
          </div>
        </div>
        <div className={`${exam.theory_content_url ? 'w-80' : 'flex-1'} bg-white overflow-y-auto p-6 flex flex-col`}>
          {exam.has_obj ? (
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-800">Objective Section</h3>
              <p className="text-xs text-gray-500 mb-6">Click the letter to bubble your answer.</p>
              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div key={q} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
                      <span className="font-bold text-gray-700 w-8">{q}.</span>
                      <div className="flex gap-2">
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <button key={opt} onClick={() => handleSelect(q, opt)}
                            className={`w-8 h-8 rounded-full font-bold text-sm border-2 transition-all ${answers[q] === opt ? 'bg-school-green-600 border-school-green-600 text-white shadow-md transform scale-110' : 'bg-white border-gray-300 text-gray-500 hover:border-school-green-400 hover:text-school-green-600'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">Objective section enabled, but no answer key was provided by the admin.</div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-purple-900/10 rounded-2xl border-2 border-dashed border-purple-300">
              <div className="w-16 h-16 bg-purple-900 text-white rounded-full flex items-center justify-center text-3xl mb-4 shadow-lg">✍️</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-wide">Theory on Paper — Secure Digital Proctor Mode</h3>
              <p className="text-gray-600 max-w-md leading-relaxed text-sm">
                Read your Twi, Ga, Science, or General questions on the digital paper document. Write all full theory solutions and draw diagrams clearly inside the official physical answer booklet provided by your invigilator. Ensure your Student ID is written on all booklets before clicking "Submit Exam".
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
