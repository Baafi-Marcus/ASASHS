import React, { useState } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { QuizRunner } from './QuizRunner';

export function ExamRunner({ studentId, exam, onClose }: { studentId: number, exam: any, onClose: () => void }) {
  if (exam.quiz_id) {
    return <QuizRunner studentId={studentId} quizId={exam.quiz_id} onClose={onClose} />;
  }

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If there's an answer key, generate an array of questions [1, 2, 3...]
  const objQuestionsCount = exam.obj_answer_key ? exam.obj_answer_key.length : 0;
  const questions = Array.from({ length: objQuestionsCount }, (_, i) => i + 1);

  const handleSelect = (qNum: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qNum]: option }));
  };

  const handleSubmit = async () => {
    if (exam.has_obj && Object.keys(answers).length < objQuestionsCount) {
      if (!window.confirm('You have unanswered objective questions. Submit anyway?')) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let objScore = 0;
      
      // Auto Grade OBJ
      if (exam.has_obj && exam.obj_answer_key) {
        const keyArray = exam.obj_answer_key.split('');
        let correctCount = 0;
        
        for (let i = 0; i < keyArray.length; i++) {
          if (answers[i + 1] === keyArray[i]) {
            correctCount++;
          }
        }
        
        // Calculate proportional OBJ score from max_score. 
        // e.g. if max_score is 100, and it's half OBJ half Theory, usually we just scale. 
        // Let's assume OBJ max is proportional or just record raw points.
        // For simplicity, let's just record raw count, or out of 100.
        // Actually, let's record correctCount as the obj_score directly, meaning each question is 1 pt.
        objScore = correctCount; 
      }

      await db.submitExam({
        assignment_id: exam.id,
        student_id: studentId,
        obj_score: objScore
      });

      toast.success('Exam submitted successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[85vh]">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center px-6 shrink-0">
        <div>
          <h2 className="text-xl font-bold">{exam.title}</h2>
          <p className="text-sm text-gray-400">{exam.subject_name} • {exam.exam_type}</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="px-6 py-2 bg-school-green-500 hover:bg-school-green-400 text-white font-bold rounded-xl transition"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Document Viewer (if Theory or PDF exists) */}
        <div className={`flex-1 bg-gray-100 p-4 overflow-y-auto border-r ${!exam.theory_content_url ? 'hidden' : ''}`}>
          <div className="bg-white w-full h-full rounded-xl shadow-sm flex flex-col">
            <div className="p-3 border-b bg-gray-50 rounded-t-xl font-bold text-gray-700">Exam Paper Document</div>
            {exam.theory_content_url ? (
              <iframe 
                src={exam.theory_content_url} 
                className="w-full flex-1 rounded-b-xl"
                title="Exam Document"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                No document provided.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: OBJ Bubble Sheet */}
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
                          <button
                            key={opt}
                            onClick={() => handleSelect(q, opt)}
                            className={`w-8 h-8 rounded-full font-bold text-sm border-2 transition-all ${
                              answers[q] === opt 
                                ? 'bg-school-green-600 border-school-green-600 text-white shadow-md transform scale-110' 
                                : 'bg-white border-gray-300 text-gray-500 hover:border-school-green-400 hover:text-school-green-600'
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
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                  Objective section enabled, but no answer key was provided by the admin.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Theory Only Exam</h3>
              <p className="text-gray-500">Please answer all questions on the physical paper provided to you. When you are finished, you may click "Submit Exam" to lock in your attendance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
