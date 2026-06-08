import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { PortalInput } from '../../components/PortalInput';
import { documentParser } from '../../../lib/documentParser';
import { aiService, ExtractedQuestion } from '../../lib/aiService';

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
    time_limit: 30,
    passing_score: 50,
    shuffle_questions: false,
    shuffle_options: false,
    show_results_immediately: true,
    allow_answer_review: false,
    display_mode: 'all_at_once',
    allow_late_grading: false
  });

  // Questions
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchTeacherData();
  }, [teacherId]);

  const fetchTeacherData = async () => {
    try {
      const teacherSubjects = await db.getTeacherSubjects(teacherId);
      
      // Get unique classes
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
      toast.loading('Parsing file...', { id: 'ai-gen' });
      const text = await documentParser.parseFile(file);
      
      toast.loading('AI is generating questions...', { id: 'ai-gen' });
      const generated = await aiService.extractQuestions(text);
      
      setQuestions([...questions, ...generated]);
      toast.success('Questions generated! You can now review and edit them.', { id: 'ai-gen' });
    } catch (error: any) {
      console.error('AI Generation failed:', error);
      toast.error(error.message || 'AI generation failed', { id: 'ai-gen' });
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

  const handleSaveQuiz = async () => {
    if (!quizInfo.title || !quizInfo.class_id || !quizInfo.subject_id) {
      toast.error('Please fill in all basic quiz information.');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question.');
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
      
      toast.success('Quiz created successfully!');
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
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <div className="flex space-x-2">
          {[1, 2].map(s => (
            <div key={s} className={`w-3 h-3 rounded-full ${step >= s ? 'bg-school-green-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      {step === 1 ? (
        <PortalCard title="Step 1: Quiz Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div className="md:col-span-2">
              <PortalInput
                label="Quiz Title"
                value={quizInfo.title}
                onChange={e => setQuizInfo({ ...quizInfo, title: e.target.value })}
                placeholder="e.g., Mathematics Mid-Term Quiz"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-school-green-500"
                value={quizInfo.description}
                onChange={e => setQuizInfo({ ...quizInfo, description: e.target.value })}
                rows={2}
                placeholder="Describe the quiz topics..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Examination Rules & Instructions</label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-school-green-500"
                value={quizInfo.instructions}
                onChange={e => setQuizInfo({ ...quizInfo, instructions: e.target.value })}
                rows={4}
                placeholder="List the rules for this assessment (e.g., 1. No calculators allowed...)"
              />
              <p className="text-xs text-gray-500 mt-1">These will be shown to the student on the cover page before they start.</p>
            </div>
            <PortalInput
              label="Select Class"
              as="select"
              value={quizInfo.class_id}
              onChange={e => setQuizInfo({ ...quizInfo, class_id: e.target.value, subject_id: '' })}
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
              ))}
            </PortalInput>
            <PortalInput
              label="Select Subject"
              as="select"
              value={quizInfo.subject_id}
              onChange={e => setQuizInfo({ ...quizInfo, subject_id: e.target.value })}
            >
              <option value="">Select Subject</option>
              {subjects.filter(s => s.class_id == quizInfo.class_id).map(s => (
                <option key={s.id} value={s.subject_id}>{s.subject_name}</option>
              ))}
            </PortalInput>
            <PortalInput
              label="Scheduled Start Date & Time"
              type="datetime-local"
              value={quizInfo.due_date}
              onChange={e => setQuizInfo({ ...quizInfo, due_date: e.target.value })}
            />
            <PortalInput
              label="Duration (Minutes)"
              type="number"
              min="1"
              value={quizInfo.duration_minutes}
              onChange={e => setQuizInfo({ ...quizInfo, duration_minutes: parseInt(e.target.value) || 60 })}
            />
            <PortalInput
              label="Time Limit (Minutes)"
              type="number"
              value={quizInfo.time_limit}
              onChange={e => setQuizInfo({ ...quizInfo, time_limit: parseInt(e.target.value) })}
            />
            <PortalInput
              label="Passing Score (%)"
              type="number"
              value={quizInfo.passing_score}
              onChange={e => setQuizInfo({ ...quizInfo, passing_score: parseInt(e.target.value) })}
            />
            
            <div className="md:col-span-2 pt-4 border-t mt-4">
              <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase">Advanced Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border">
                  <input type="checkbox" checked={quizInfo.shuffle_questions} onChange={e => setQuizInfo({...quizInfo, shuffle_questions: e.target.checked})} className="rounded text-school-green-600 w-5 h-5"/>
                  <span className="text-sm font-medium text-gray-700">Shuffle Questions for each student</span>
                </label>
                <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border">
                  <input type="checkbox" checked={quizInfo.shuffle_options} onChange={e => setQuizInfo({...quizInfo, shuffle_options: e.target.checked})} className="rounded text-school-green-600 w-5 h-5"/>
                  <span className="text-sm font-medium text-gray-700">Shuffle Options (MCQ only)</span>
                </label>
                <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border">
                  <input type="checkbox" checked={quizInfo.show_results_immediately} onChange={e => setQuizInfo({...quizInfo, show_results_immediately: e.target.checked})} className="rounded text-school-green-600 w-5 h-5"/>
                  <span className="text-sm font-medium text-gray-700">Show score immediately after submission</span>
                </label>
                <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border">
                  <input type="checkbox" checked={quizInfo.allow_answer_review} onChange={e => setQuizInfo({...quizInfo, allow_answer_review: e.target.checked})} className="rounded text-school-green-600 w-5 h-5"/>
                  <span className="text-sm font-medium text-gray-700">Allow students to review their answers</span>
                </label>
                <div className="flex flex-col space-y-1 bg-gray-50 p-3 rounded-xl border">
                  <label className="text-xs font-bold text-gray-500">Display Mode</label>
                  <select value={quizInfo.display_mode} onChange={e => setQuizInfo({...quizInfo, display_mode: e.target.value})} className="border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="all_at_once">Show All Questions at Once (Scroll)</option>
                    <option value="one_by_one">Show One by One (Paginated)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end p-4 border-t">
            <PortalButton onClick={() => setStep(2)}>
              Next: Add Questions
            </PortalButton>
          </div>
        </PortalCard>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Quiz Content</h2>
              
              {questions.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">No questions added yet. Use AI or add manually.</p>
                </div>
              )}

              {questions.map((q, idx) => (
                <PortalCard key={idx} className="relative group">
                  <button 
                    onClick={() => removeQuestion(idx)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="bg-school-green-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold uppercase text-gray-400">{q.question_type}</span>
                      <div className="ml-auto flex items-center space-x-1">
                        <span className="text-xs text-gray-400">Points:</span>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          className="w-16 px-2 py-1 border rounded text-sm font-bold text-center"
                          value={q.points || 1}
                          onChange={e => updateQuestion(idx, { ...q, points: parseFloat(e.target.value) || 1 })}
                        />
                      </div>
                    </div>
                    <textarea
                      className="w-full p-2 border-b font-medium focus:outline-none focus:border-school-green-500"
                      value={q.question_text}
                      onChange={e => updateQuestion(idx, { ...q, question_text: e.target.value })}
                      placeholder="Question text..."
                    />
                    
                    {/* Render specific inputs based on type */}
                    {q.question_type === 'multiple_choice' && q.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                            <input 
                              type="radio" 
                              checked={opt.is_correct}
                              onChange={() => {
                                const newOpts = q.options?.map((o, i) => ({ ...o, is_correct: i === oIdx }));
                                updateQuestion(idx, { ...q, options: newOpts });
                              }}
                            />
                            <input 
                              className="bg-transparent flex-1 text-sm outline-none"
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
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400">Correct Answers (Comma separated)</label>
                        <input 
                          className="w-full p-2 bg-gray-50 rounded text-sm"
                          value={q.correct_answers?.join(', ')}
                          onChange={e => updateQuestion(idx, { ...q, correct_answers: e.target.value.split(',').map(s => s.trim()) })}
                          placeholder="e.g. 8, eight, Eight"
                        />
                      </div>
                    )}
                  </div>
                </PortalCard>
              ))}

              <div className="flex space-x-4 pt-4">
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
                >
                  + Add MCQ
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
                >
                  + Add Fill-in
                </PortalButton>
              </div>
            </div>

            <div className="space-y-6">
              <PortalCard title="AI Generation">
                <p className="text-sm text-gray-600 mb-4">
                  Upload lesson notes (PDF, Word, or Text) to automatically generate questions.
                </p>
                <div className="border-2 border-dashed border-school-green-200 rounded-xl p-6 text-center hover:border-school-green-400 transition-colors">
                  <input
                    type="file"
                    id="ai-upload"
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="ai-upload" className="cursor-pointer">
                    <div className="bg-school-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-school-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div className="font-semibold text-school-green-700">Upload Document</div>
                    <div className="text-xs text-gray-500">PDF, Word, or TXT</div>
                  </label>
                </div>
              </PortalCard>

              <PortalCard title="Summary">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions</span>
                    <span className="font-bold">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Points</span>
                    <span className="font-bold">{questions.reduce((sum, q) => sum + (q.points || 1), 0)}</span>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t space-y-2">
                  <PortalButton 
                    className="w-full"
                    onClick={handleSaveQuiz}
                    disabled={loading || isGenerating}
                  >
                    {loading ? 'Publishing...' : 'Publish Quiz'}
                  </PortalButton>
                  <PortalButton 
                    className="w-full"
                    variant="secondary"
                    onClick={() => setStep(1)}
                  >
                    Back to Settings
                  </PortalButton>
                </div>
              </PortalCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
