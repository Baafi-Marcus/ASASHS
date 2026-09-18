import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { PortalInput } from '../../components/PortalInput';
import { documentParser } from '../../../lib/documentParser';
import { aiService, ExtractedQuestion } from '../../lib/aiService';
import { TeacherQuestionImporter, ImporterQuestion } from '../../components/teacher/TeacherQuestionImporter';

interface QuizBuilderProps {
  teacherId: number;
  onClose: () => void;
}

export function QuizBuilder({ teacherId, onClose }: QuizBuilderProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Quiz Info
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    instructions: '',
    class_id: '',
    subject_id: '',
    due_date: '',
    duration_minutes: 60,
    passing_score: 50,
    shuffle_questions: false,
    shuffle_options: false,
    show_results_immediately: true,
    allow_answer_review: false,
    display_mode: 'all_at_once',
    allow_late_grading: false,
    max_attempts: 1,
    allow_offline: false
  });

  // Questions
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSmartImporter, setShowSmartImporter] = useState(false);

  useEffect(() => {
    fetchTeacherData();
  }, [teacherId]);

  const fetchTeacherData = async () => {
    try {
      const teacherSubjects = await db.getTeacherSubjects(teacherId);
      const uniqueClasses = Array.from(new Set(teacherSubjects.map((s: any) => s.class_id)))
        .map(id => teacherSubjects.find((s: any) => s.class_id === id));
      
      setClasses(uniqueClasses);
      setSubjects(teacherSubjects);
    } catch (error) {
      console.error('Failed to fetch teacher data:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGenerating(true);
    try {
      toast.loading('Parsing document content...', { id: 'ai-gen' });
      const text = await documentParser.parseFile(file);
      
      toast.loading('AI is generating assessment questions...', { id: 'ai-gen' });
      const generated = await aiService.extractQuestions(text);
      
      setQuestions([...questions, ...generated]);
      toast.success('Questions extracted successfully. You can now review them.', { id: 'ai-gen' });
    } catch (error: any) {
      console.error('AI Generation failed:', error);
      toast.error(error.message || 'AI question generation failed', { id: 'ai-gen' });
    } finally {
      setIsGenerating(false);
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updated: ExtractedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updated;
    setQuestions(newQuestions);
  };

  const handleImportQuestions = (imported: ImporterQuestion[]) => {
    const converted: ExtractedQuestion[] = imported.map(q => ({
      question_text: q.question_text,
      question_type: q.question_type as any,
      points: q.points || 1,
      imageDataUrl: q.imageDataUrl,
      diagramDescription: q.diagramDescription,
      options: q.options ? q.options.map((opt, i) => ({
        id: `opt-${i}-${Date.now()}`,
        option_text: opt.option_text,
        is_correct: opt.is_correct
      })) : undefined,
      correct_answers: q.correct_answers
    }));
    setQuestions(prev => [...prev, ...converted]);
  };

  const handleSaveQuiz = async () => {
    if (!quizInfo.title || !quizInfo.class_id || !quizInfo.subject_id) {
      toast.error('Please complete all required quiz parameters');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please configure at least one question');
      return;
    }

    setLoading(true);
    try {
      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
      
      await db.createQuiz({
        ...quizInfo,
        teacher_id: teacherId,
        total_points: totalPoints,
        questions: questions.map((q, idx) => ({ ...q, order_index: idx }))
      });
      
      toast.success('Quiz published successfully');
      onClose();
    } catch (error) {
      console.error('Failed to create quiz:', error);
      toast.error('Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={onClose} 
          className="text-gray-600 hover:text-gray-900 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Return to Assessments
        </button>
        <div className="flex items-center gap-2">
          {[1, 2].map(s => (
            <div 
              key={s} 
              className={`w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-bold font-mono tabular-nums border ${
                step >= s 
                  ? 'bg-school-green-700 text-white border-school-green-700' 
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {step === 1 ? (
        <PortalCard className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-base font-bold text-gray-900">Step 1: Assessment Specifications</h2>
            <p className="text-xs text-gray-500">Configure quiz scheduling, passing metrics, and proctoring rules</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <PortalInput
                id="quiz_title"
                label="Assessment Title *"
                value={quizInfo.title}
                onChange={e => setQuizInfo({ ...quizInfo, title: e.target.value })}
                placeholder="e.g. Form 2 General Science Mid-Term Quiz"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Topic Outline</label>
              <textarea
                className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                value={quizInfo.description}
                onChange={e => setQuizInfo({ ...quizInfo, description: e.target.value })}
                rows={2}
                placeholder="Brief summary of covered concepts..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Student Instructions & Proctoring Rules</label>
              <textarea
                className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                value={quizInfo.instructions}
                onChange={e => setQuizInfo({ ...quizInfo, instructions: e.target.value })}
                rows={3}
                placeholder="Rules shown on the cover page before starting..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Class *</label>
              <select
                value={quizInfo.class_id}
                onChange={e => setQuizInfo({ ...quizInfo, class_id: e.target.value, subject_id: '' })}
                className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Domain *</label>
              <select
                value={quizInfo.subject_id}
                onChange={e => setQuizInfo({ ...quizInfo, subject_id: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
              >
                <option value="">Select Subject</option>
                {subjects.filter(s => s.class_id == quizInfo.class_id).map(s => (
                  <option key={s.id} value={s.subject_id}>{s.subject_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Scheduled Date & Time</label>
              <input
                type="datetime-local"
                value={quizInfo.due_date}
                onChange={e => setQuizInfo({ ...quizInfo, due_date: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 tabular-nums focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  min="1"
                  value={quizInfo.duration_minutes}
                  onChange={e => setQuizInfo({ ...quizInfo, duration_minutes: parseInt(e.target.value) || 60 })}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 tabular-nums focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pass Mark (%)</label>
                <input
                  type="number"
                  value={quizInfo.passing_score}
                  onChange={e => setQuizInfo({ ...quizInfo, passing_score: parseInt(e.target.value) || 50 })}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 tabular-nums focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                />
              </div>
            </div>
            
            <div className="md:col-span-2 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Assessment Controls</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-center space-x-2.5 bg-gray-50 p-3 rounded-sm border border-gray-200 cursor-pointer min-h-[44px]">
                  <input 
                    type="checkbox" 
                    checked={quizInfo.shuffle_questions} 
                    onChange={e => setQuizInfo({...quizInfo, shuffle_questions: e.target.checked})} 
                    className="rounded-sm text-school-green-700 w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">Shuffle questions per student</span>
                </label>
                <label className="flex items-center space-x-2.5 bg-gray-50 p-3 rounded-sm border border-gray-200 cursor-pointer min-h-[44px]">
                  <input 
                    type="checkbox" 
                    checked={quizInfo.shuffle_options} 
                    onChange={e => setQuizInfo({...quizInfo, shuffle_options: e.target.checked})} 
                    className="rounded-sm text-school-green-700 w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">Shuffle options (MCQ)</span>
                </label>
                <label className="flex items-center space-x-2.5 bg-gray-50 p-3 rounded-sm border border-gray-200 cursor-pointer min-h-[44px]">
                  <input 
                    type="checkbox" 
                    checked={quizInfo.show_results_immediately} 
                    onChange={e => setQuizInfo({...quizInfo, show_results_immediately: e.target.checked})} 
                    className="rounded-sm text-school-green-700 w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">Show score upon submission</span>
                </label>
                <label className="flex items-center space-x-2.5 bg-gray-50 p-3 rounded-sm border border-gray-200 cursor-pointer min-h-[44px]">
                  <input 
                    type="checkbox" 
                    checked={quizInfo.allow_answer_review} 
                    onChange={e => setQuizInfo({...quizInfo, allow_answer_review: e.target.checked})} 
                    className="rounded-sm text-school-green-700 w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">Allow post-submission review</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <PortalButton onClick={() => setStep(2)} variant="primary">
              Next: Question Content →
            </PortalButton>
          </div>
        </PortalCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider">Question Bank</h2>
              <span className="text-xs font-mono tabular-nums text-gray-500 font-semibold">{questions.length} questions configured</span>
            </div>
            
            {questions.length === 0 && (
              <div className="text-center py-16 bg-white rounded-sm border border-dashed border-gray-300">
                <p className="text-xs text-gray-500">No questions added yet. Add manually or use the studio.</p>
              </div>
            )}

            {questions.map((q, idx) => (
              <PortalCard key={idx} className="p-5 relative group">
                <button 
                  onClick={() => removeQuestion(idx)}
                  className="absolute top-4 right-4 text-xs font-semibold text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-900 text-white w-5 h-5 flex items-center justify-center rounded-sm text-xs font-mono tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">{q.question_type}</span>
                    <div className="ml-auto flex items-center space-x-1 pr-14">
                      <span className="text-xs text-gray-500">Marks:</span>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        className="w-14 px-1.5 py-0.5 border border-gray-300 rounded-sm text-xs font-mono tabular-nums font-bold text-center"
                        value={q.points || 1}
                        onChange={e => updateQuestion(idx, { ...q, points: parseFloat(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                  <textarea
                    className="w-full p-2 border border-gray-200 rounded-sm text-sm font-medium focus:outline-none focus:border-school-green-600"
                    value={q.question_text}
                    onChange={e => updateQuestion(idx, { ...q, question_text: e.target.value })}
                    placeholder="Enter question text..."
                    rows={2}
                  />
                  
                  {/* Options */}
                  {q.question_type === 'multiple_choice' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center space-x-2 bg-gray-50 border border-gray-200 p-2 rounded-sm">
                          <input 
                            type="radio" 
                            name={`q-${idx}-correct`}
                            checked={opt.is_correct}
                            onChange={() => {
                              const newOpts = q.options?.map((o, i) => ({ ...o, is_correct: i === oIdx }));
                              updateQuestion(idx, { ...q, options: newOpts });
                            }}
                          />
                          <input 
                            className="bg-transparent flex-1 text-xs outline-none text-gray-900"
                            value={opt.option_text}
                            onChange={e => {
                              const newOpts = [...(q.options || [])];
                              newOpts[oIdx].option_text = e.target.value;
                              updateQuestion(idx, { ...q, options: newOpts });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {q.question_type === 'short_answer' && (
                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Accepted Answers (Comma Separated)</label>
                      <input 
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-sm text-xs"
                        value={q.correct_answers?.join(', ')}
                        onChange={e => updateQuestion(idx, { ...q, correct_answers: e.target.value.split(',').map(s => s.trim()) })}
                        placeholder="e.g. Photosynthesis, photo-synthesis"
                      />
                    </div>
                  )}
                </div>
              </PortalCard>
            ))}

            <div className="flex gap-2 pt-2">
              <PortalButton 
                onClick={() => setQuestions([...questions, { 
                  question_text: '', 
                  question_type: 'multiple_choice', 
                  points: 1, 
                  order_index: questions.length,
                  options: [
                    { option_text: 'Option 1', is_correct: true },
                    { option_text: 'Option 2', is_correct: false },
                    { option_text: 'Option 3', is_correct: false },
                    { option_text: 'Option 4', is_correct: false }
                  ]
                }])}
                variant="secondary"
                className="text-xs"
              >
                Add Multiple Choice
              </PortalButton>
              <PortalButton 
                onClick={() => setQuestions([...questions, { 
                  question_text: '', 
                  question_type: 'short_answer', 
                  points: 1, 
                  order_index: questions.length,
                  correct_answers: ['']
                }])}
                variant="secondary"
                className="text-xs"
              >
                Add Short Answer
              </PortalButton>
            </div>
          </div>

          <div className="space-y-4">
            <PortalCard className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Question Studio</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Import from past examination documents, convert LaTeX formulas, or batch-upload TSV spreadsheets.
              </p>
              <PortalButton
                variant="primary"
                className="w-full text-xs"
                onClick={() => setShowSmartImporter(true)}
              >
                Open Question Studio
              </PortalButton>
            </PortalCard>

            <PortalCard className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">AI Question Generation</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Upload lecture notes or textbook chapters to extract questions automatically.
              </p>
              <div className="border border-dashed border-gray-300 rounded-sm p-4 text-center hover:border-school-green-600 transition-colors">
                <input
                  type="file"
                  id="ai-upload"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                />
                <label htmlFor="ai-upload" className="cursor-pointer">
                  <div className="text-xs font-semibold text-school-green-800">Choose File (.pdf, .docx)</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Click to browse and parse</div>
                </label>
              </div>
            </PortalCard>

            <PortalCard className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total Questions</span>
                  <span className="font-bold text-gray-900 tabular-nums">{questions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Aggregate Marks</span>
                  <span className="font-bold text-gray-900 tabular-nums">
                    {questions.reduce((sum, q) => sum + (q.points || 1), 0)}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <PortalButton 
                  className="w-full text-xs"
                  variant="primary"
                  onClick={handleSaveQuiz}
                  loading={loading}
                  loadingText="Publishing..."
                  disabled={loading || isGenerating}
                >
                  Publish Assessment
                </PortalButton>
                <PortalButton 
                  className="w-full text-xs"
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  Back to Parameters
                </PortalButton>
              </div>
            </PortalCard>
          </div>
        </div>
      )}

      <TeacherQuestionImporter
        isOpen={showSmartImporter}
        onClose={() => setShowSmartImporter(false)}
        onImportQuestions={handleImportQuestions}
      />
    </div>
  );
}
