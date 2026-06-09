import React, { useState, useEffect } from 'react';
import db from '../../../lib/neon';

const TestTeacherView: React.FC<{ activeTab: string; fullName: string }> = ({ activeTab, fullName }) => {
  const [demoQuizzes, setDemoQuizzes] = useState<any[]>([]);
  const [demoExams, setDemoExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    db.getQuizzes({}).then((all: any[]) => {
      setDemoQuizzes((all || []).filter((q: any) => q.title?.includes('[DEMO]')));
    }).catch(() => {});
    db.getGeneralExams().then((all: any[]) => {
      setDemoExams((all || []).filter((e: any) => e.title?.includes('[DEMO]')));
    }).catch(() => {});
    db.getClasses().then((all: any[]) => setClasses(all || [])).catch(() => {});
    db.getSubjects().then((all: any[]) => setSubjects(all || [])).catch(() => {});
  }, []);

  const viewQuizQuestions = async (quiz: any) => {
    try {
      const data = await db.getQuizById(quiz.id);
      if (data?.questions) setQuizQuestions(data.questions);
      else setQuizQuestions([]);
      setSelectedQuiz(quiz);
      setShowQuestions(true);
    } catch { setQuizQuestions([]); }
  };

  const renderContent = () => {
    if (showQuestions && selectedQuiz) {
      return (
        <div className="space-y-4">
          <button onClick={() => { setShowQuestions(false); setSelectedQuiz(null); }} className="text-school-green-600 hover:underline">&larr; Back</button>
          <h2 className="text-2xl font-bold text-gray-800">{selectedQuiz.title} — Questions</h2>
          <p className="text-sm text-gray-500">{selectedQuiz.subject_name}</p>
          <div className="space-y-3">
            {quizQuestions.map((q: any, i: number) => (
              <div key={q.id || i} className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
                <p className="font-bold mb-3">{i + 1}. {q.question_text}</p>
                <div className="space-y-1.5 ml-4">
                  {(q.options || []).map((opt: any, oi: number) => (
                    <p key={oi} className={`text-sm ${opt.is_correct ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                      {String.fromCharCode(65 + oi)}. {opt.option_text} {opt.is_correct ? '✓' : ''}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-school-green-800 to-teal-900 rounded-2xl p-8 text-white shadow-2xl">
              <h2 className="text-3xl font-black mb-2">Teacher View (Demo Mode)</h2>
              <p className="text-school-green-100 text-lg">Welcome, {fullName}! Browse teacher features below.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-bold text-gray-800">Demo Quizzes</h3>
                <p className="text-2xl font-black text-school-green-600 mt-1">{demoQuizzes.length}</p>
                <p className="text-sm text-gray-500">in E-Learning</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-2">📋</div>
                <h3 className="font-bold text-gray-800">Demo Exams</h3>
                <p className="text-2xl font-black text-school-green-600 mt-1">{demoExams.length}</p>
                <p className="text-sm text-gray-500">in School Exams</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Demo Mode:</strong> All data shown is read-only. You can browse but not modify anything.
            </div>
          </div>
        );

      case 'classes':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Demo Classes ({classes.length})</h2>
            <div className="grid gap-3">
              {classes.map((c: any, i: number) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">{c.class_name}</h3>
                    <p className="text-sm text-gray-500">Form {c.form}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'assignments':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Demo Assignments</h2>
            <div className="bg-white rounded-xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-3">📝</div>
              <p>In demo mode, you can browse existing assignments. Create functionality is disabled.</p>
            </div>
            {demoExams.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-700 mb-2">Available Demo Assignments (Exams)</h3>
                {demoExams.map((e, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow border border-gray-100 mb-2 flex justify-between items-center">
                    <span className="font-medium">{e.title}</span>
                    <span className="text-sm text-gray-500">{e.subject_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'exams':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Demo School Exams</h2>
            {demoExams.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-300">No demo exams available.</div>
            ) : (
              <div className="grid gap-3">
                {demoExams.map((exam, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800">{exam.title}</h3>
                      <p className="text-sm text-gray-500">{exam.subject_name} — {exam.class_name}</p>
                    </div>
                    <button onClick={() => viewQuizQuestions({ id: exam.quiz_id, title: exam.title, subject_name: exam.subject_name })} className="px-3 py-1.5 bg-school-green-600 text-white rounded-lg text-sm font-medium hover:bg-school-green-700" disabled={!exam.quiz_id}>
                      View Questions
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'grades':
      case 'performance':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Demo {activeTab === 'grades' ? 'Gradebook' : 'Performance'}</h2>
            <div className="bg-white rounded-xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-3">📊</div>
              <p>Student grades and performance analytics would appear here for your assigned classes.</p>
              {subjects.length > 0 && (
                <div className="mt-4 text-left max-w-md mx-auto">
                  <p className="text-sm font-medium text-gray-700 mb-2">Active subjects in system:</p>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s: any, i: number) => (
                      <span key={i} className="px-3 py-1 bg-school-green-50 text-school-green-700 rounded-full text-sm">{s.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Demo Messages</h2>
            <div className="bg-white rounded-xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-3">💬</div>
              <p>Messaging is read-only in demo mode. Browse the interface below.</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="font-medium text-gray-800">Academic Office</p>
                  <p className="text-xs text-gray-400 mt-1">Staff meeting tomorrow at 2pm</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="font-medium text-gray-800">HOD, Science</p>
                  <p className="text-xs text-gray-400 mt-1">Please submit exam questions by Friday</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="font-medium text-gray-800">Administration</p>
                  <p className="text-xs text-gray-400 mt-1">End-of-term reports due next week</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'elearning':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Demo E-Learning Quizzes</h2>
            {demoQuizzes.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-300">No demo quizzes available.</div>
            ) : (
              <div className="grid gap-3">
                {demoQuizzes.map((quiz, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800">{quiz.title}</h3>
                      <p className="text-sm text-gray-500">{quiz.subject_name} — {quiz.class_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => viewQuizQuestions(quiz)} className="px-3 py-1.5 bg-school-green-600 text-white rounded-lg text-sm font-medium hover:bg-school-green-700">
                        View Questions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">My Profile (Demo)</h2>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 max-w-lg">
              <div className="space-y-4">
                <div><span className="text-sm text-gray-500">Name</span><p className="font-medium">{fullName}</p></div>
                <div><span className="text-sm text-gray-500">Role</span><p className="font-medium">Teacher (Test Account)</p></div>
                <div><span className="text-sm text-gray-500">Department</span><p className="font-medium">Demo Department</p></div>
                <div><span className="text-sm text-gray-500">Status</span><p className="text-amber-600 font-medium">Demo Mode — Read Only</p></div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">{renderContent()}</div>
    </div>
  );
};

export default TestTeacherView;
