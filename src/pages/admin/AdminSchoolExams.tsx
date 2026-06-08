import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { SmartExamBuilder } from '../../components/SmartExamBuilder';
import { ExtractedQuestion } from '../../lib/aiService';
import { parseDate, getScheduleStatus, getStatusLabel, getStatusColor } from '../../lib/dates';
import { MathText } from '../../components/MathText';

function ViewExamModal({ exam, allExams, onClose }: { exam: any; allExams: any[]; onClose: () => void }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const related = allExams.filter(e => e.title === exam.title && e.due_date === exam.due_date);
  const targetClasses = [...new Set(related.map(e => `${e.class_name} (Form ${e.form})`))];

  useEffect(() => {
    if (exam.quiz_id) {
      setLoadingQ(true);
      db.getQuizById(exam.quiz_id)
        .then(data => { if (data) setQuestions(data.questions || []); })
        .catch(() => toast.error('Failed to load questions'))
        .finally(() => setLoadingQ(false));
    }
  }, [exam.quiz_id]);

  const start = parseDate(exam.due_date);
  const end = start ? new Date(start.getTime() + (exam.duration_minutes || 60) * 60000) : null;
  const status = getScheduleStatus(exam.due_date, exam.duration_minutes);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-school-green-600 text-white shrink-0">
          <h2 className="text-xl font-bold">{exam.title}</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Type</label><p className="font-medium">{exam.exam_type || 'General'}</p></div>
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Subject</label><p className="font-medium">{exam.subject_name}</p></div>
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Status</label><p className={`font-bold ${status === 'ended' ? 'text-red-600' : status === 'upcoming' ? 'text-blue-600' : 'text-green-600'}`}>{status === 'ended' ? 'Ended' : status === 'upcoming' ? 'Upcoming' : 'Active'}</p></div>
            {start && <div><label className="text-[10px] font-bold text-gray-500 uppercase">Start</label><p className="font-medium">{start.toLocaleString()}</p></div>}
            {end && <div><label className="text-[10px] font-bold text-gray-500 uppercase">End</label><p className="font-medium">{end.toLocaleString()}</p></div>}
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Duration</label><p className="font-medium">{exam.duration_minutes || 60} mins</p></div>
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Max Score</label><p className="font-medium">{exam.max_score || 100}</p></div>
            <div className="col-span-2"><label className="text-[10px] font-bold text-gray-500 uppercase">Target Classes</label><p className="font-medium">{targetClasses.join(', ') || 'N/A'}</p></div>
          </div>
          <div className="flex gap-2">
            {exam.has_obj && <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200">Objective</span>}
            {exam.has_theory && <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-200">Theory</span>}
          </div>
          {exam.instructions && (
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Instructions</label><p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{exam.instructions}</p></div>
          )}
          {(exam.shuffle_questions || exam.shuffle_options) && (
            <div className="flex gap-4 text-sm">
              {exam.shuffle_questions && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Shuffle Questions</span>}
              {exam.shuffle_options && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Shuffle Options</span>}
            </div>
          )}
          {loadingQ && <p className="text-gray-500 text-sm">Loading questions...</p>}
          {questions.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Questions ({questions.length})</label>
              <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                {questions.map((q: any, i: number) => (
                  <div key={q.id} className="bg-gray-50 p-3 rounded-xl border text-sm">
                    <span className="font-bold text-school-green-600 mr-2">Q{i + 1}.</span>
                    <MathText text={q.question_text} />
                    <span className="text-xs text-gray-400 ml-2">({q.points || 1} marks)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDateForInput(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminSchoolExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewExam, setViewExam] = useState<any | null>(null);
  const [editingExam, setEditingExam] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    exam_type: 'End of Semester',
    subject_id: '',
    due_date: '',
    duration_minutes: 60,
    max_score: 100,
    has_obj: true,
    has_theory: false,
    theory_content_url: '',
    obj_answer_key: '',
    extractedQuestions: [] as ExtractedQuestion[],
    shuffle_questions: false,
    shuffle_options: false,
    show_results_immediately: true,
    display_mode: 'all_at_once',
    max_attempts: 1,
    selectedForms: [] as number[], 
    selectedCourses: [] as number[], 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiBuilder, setShowAiBuilder] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsData, subjectsData, classesData, coursesData] = await Promise.all([
        db.getGeneralExams(),
        db.getSubjects(),
        db.getClasses(),
        db.getCourses()
      ]);
      setExams(examsData || []);
      setSubjects(subjectsData || []);
      setClasses(classesData || []);
      setCourses(coursesData || []);
    } catch (error) {
      toast.error('Failed to load exams data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (exam: any) => {
    setEditingExam(exam);
    // Load questions if using AI builder
    let questions: ExtractedQuestion[] = [];
    if (exam.quiz_id) {
      const data = await db.getQuizById(exam.quiz_id).catch(() => null);
      if (data?.questions) questions = data.questions;
    }
    setFormData({
      title: exam.title,
      description: exam.description || '',
      instructions: exam.instructions || '',
      exam_type: exam.exam_type || 'End of Semester',
      subject_id: exam.subject_id.toString(),
      due_date: formatDateForInput(exam.due_date),
      duration_minutes: exam.duration_minutes || 60,
      max_score: exam.max_score || 100,
      has_obj: exam.has_obj,
      has_theory: exam.has_theory,
      theory_content_url: exam.theory_content_url || '',
      obj_answer_key: exam.obj_answer_key || '',
      extractedQuestions: questions,
      shuffle_questions: exam.shuffle_questions || false,
      shuffle_options: exam.shuffle_options || false,
      show_results_immediately: exam.show_results_immediately !== false,
      display_mode: exam.display_mode || 'all_at_once',
      max_attempts: exam.max_attempts ?? 1,
      selectedForms: [exam.form],
      selectedCourses: exam.course_id ? [exam.course_id] : [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingExam(null);
    setFormData({
      title: '', description: '', instructions: '', exam_type: 'End of Semester',
      subject_id: '', due_date: '', duration_minutes: 60, max_score: 100,
      has_obj: true, has_theory: false, theory_content_url: '', obj_answer_key: '',
      extractedQuestions: [], shuffle_questions: false, shuffle_options: false,
      show_results_immediately: true, display_mode: 'all_at_once', max_attempts: 1,
      selectedForms: [], selectedCourses: [],
    });
  };

  const handleDelete = async (title: string, dueDate: string) => {
    if (window.confirm(`Are you sure you want to delete the exam "${title}"? This will delete it for all assigned classes and remove all submissions.`)) {
      try {
        await db.deleteGeneralExam(title, dueDate);
        toast.success('Exam deleted successfully');
        fetchData();
      } catch (e) {
        toast.error('Failed to delete exam');
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.subject_id || !formData.due_date || formData.selectedForms.length === 0) {
      toast.error('Please fill all required fields and select at least one Form.');
      return;
    }
    
    if (!formData.has_obj && !formData.has_theory) {
      toast.error('The exam must have at least an Objective or Theory section.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // If editing, delete old exam first
      if (editingExam) {
        await db.deleteGeneralExam(editingExam.title, editingExam.due_date);
      }

      // Filter classes by Form and Course
      const targetClasses = classes.filter(c => {
        const matchesForm = formData.selectedForms.includes(c.form);
        const matchesCourse = formData.selectedCourses.length === 0 || formData.selectedCourses.includes(c.course_id);
        return matchesForm && matchesCourse;
      });
      
      if (targetClasses.length === 0) {
        toast.error('No classes match the selected Forms and Departments.');
        setIsSubmitting(false);
        return;
      }

      const classIds = targetClasses.map(c => c.id);
      
      await db.createGeneralExam({
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        exam_type: formData.exam_type,
        subject_id: parseInt(formData.subject_id),
        due_date: formData.due_date,
        duration_minutes: Number(formData.duration_minutes),
        max_score: Number(formData.max_score),
        has_obj: formData.has_obj,
        has_theory: formData.has_theory,
        theory_content_url: formData.theory_content_url || undefined,
        obj_answer_key: formData.has_obj && !formData.extractedQuestions.length ? formData.obj_answer_key.toUpperCase().replace(/\s/g, '') : undefined,
        extractedQuestions: formData.extractedQuestions,
        shuffle_questions: formData.shuffle_questions,
        shuffle_options: formData.shuffle_options,
        show_results_immediately: formData.show_results_immediately,
        display_mode: formData.display_mode,
        max_attempts: formData.max_attempts
      }, classIds);

      toast.success(editingExam ? 'Exam updated successfully!' : `Exam distributed successfully to ${classIds.length} classes!`);
      cancelEdit();
      fetchData();
    } catch (error) {
      toast.error(editingExam ? 'Failed to update exam' : 'Failed to create exams');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = (form: number) => {
    setFormData(prev => ({
      ...prev,
      selectedForms: prev.selectedForms.includes(form)
        ? prev.selectedForms.filter(f => f !== form)
        : [...prev.selectedForms, form]
    }));
  };
  
  const toggleCourse = (courseId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{editingExam ? 'Edit Exam' : 'Schedule School-Wide Exam'}</h2>
          {editingExam && (
            <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              Cancel Editing
            </button>
          )}
        </div>
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Exam Basics */}
            <div className="bg-gray-50 p-4 rounded-2xl border space-y-4">
              <h3 className="font-bold text-gray-800">1. Exam Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl"
                  placeholder="e.g. End of Semester Core Math"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Examination Rules & Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl"
                  rows={4}
                  placeholder="List the rules for this exam (e.g., 1. No cheating...)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                <select 
                  value={formData.exam_type} 
                  onChange={(e) => setFormData({...formData, exam_type: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl"
                >
                  <option value="End of Semester">End of Semester Exam</option>
                  <option value="Mid-Semester">Mid-Semester Exam</option>
                  <option value="Intervention">Intervention Exam</option>
                  <option value="Mock Exam">Mock Exam</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <select 
                  value={formData.subject_id} 
                  onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                <input 
                  type="datetime-local" 
                  value={formData.due_date} 
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.duration_minutes} 
                  onChange={(e) => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Exam Structure */}
            <div className="bg-gray-50 p-4 rounded-2xl border space-y-4">
              <h3 className="font-bold text-gray-800">2. Exam Structure</h3>
              <div className="flex gap-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.has_obj}
                    onChange={(e) => setFormData({...formData, has_obj: e.target.checked})}
                    className="w-5 h-5 rounded text-school-green-600"
                  />
                  <span className="font-medium text-gray-800">Objective Section (OBJ)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.has_theory}
                    onChange={(e) => setFormData({...formData, has_theory: e.target.checked})}
                    className="w-5 h-5 rounded text-school-green-600"
                  />
                  <span className="font-medium text-gray-800">Theory Section</span>
                </label>
              </div>
              
              {formData.has_obj && (
                <div className="p-4 bg-white rounded-xl border border-green-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-gray-800">Objective Section Setup</label>
                    {formData.extractedQuestions.length === 0 && (
                      <button 
                        type="button"
                        onClick={() => setShowAiBuilder(true)}
                        className="px-3 py-1 bg-school-green-100 text-school-green-700 rounded-lg text-xs font-bold hover:bg-school-green-200"
                      >
                        Use AI Smart Builder
                      </button>
                    )}
                  </div>
                  
                  {formData.extractedQuestions.length > 0 ? (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-green-800">{formData.extractedQuestions.length} Questions Extracted via AI</p>
                        <p className="text-xs text-green-600">Students will answer these structured questions online.</p>
                      </div>
                      <button type="button" onClick={() => setFormData({...formData, extractedQuestions: []})} className="text-sm text-red-500 hover:text-red-700 font-bold">Clear</button>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Simple Answer Key (Optional fallback)</label>
                      <input 
                        type="text" 
                        value={formData.obj_answer_key} 
                        onChange={(e) => setFormData({...formData, obj_answer_key: e.target.value})}
                        className="w-full px-4 py-2 border rounded-xl font-mono uppercase tracking-widest"
                        placeholder="e.g. ABCDABCDA..."
                      />
                      <p className="text-xs text-gray-500 mt-2">If you don't use the AI Builder, enter the correct options (A,B,C,D) here to generate a standard bubble sheet.</p>
                    </div>
                  )}

                  {/* Settings when using AI Questions */}
                  {formData.extractedQuestions.length > 0 && (
                    <div className="pt-4 border-t space-y-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase">Student Display Settings</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" checked={formData.shuffle_questions} onChange={e => setFormData({...formData, shuffle_questions: e.target.checked})} className="rounded text-school-green-600"/>
                          <span className="text-sm text-gray-700">Shuffle Questions</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" checked={formData.shuffle_options} onChange={e => setFormData({...formData, shuffle_options: e.target.checked})} className="rounded text-school-green-600"/>
                          <span className="text-sm text-gray-700">Shuffle Options</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" checked={formData.show_results_immediately} onChange={e => setFormData({...formData, show_results_immediately: e.target.checked})} className="rounded text-school-green-600"/>
                          <span className="text-sm text-gray-700">Show Results Instantly</span>
                        </label>
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Display Mode</label>
                          <select value={formData.display_mode} onChange={e => setFormData({...formData, display_mode: e.target.value})} className="border rounded px-2 py-1 text-sm">
                            <option value="all_at_once">All at Once (Scroll)</option>
                            <option value="one_by_one">One by One (Paginated)</option>
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Max Attempts</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.max_attempts}
                            onChange={e => setFormData({...formData, max_attempts: Math.max(1, parseInt(e.target.value) || 1)})}
                            className="border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {formData.has_theory && (
                <div className="p-4 bg-white rounded-xl border border-blue-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theory Document Link (PDF/DOC)</label>
                  <input 
                    type="url" 
                    value={formData.theory_content_url} 
                    onChange={(e) => setFormData({...formData, theory_content_url: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl"
                    placeholder="e.g. Google Drive or OneDrive Share Link"
                  />
                  <p className="text-xs text-gray-500 mt-2">Paste a viewable link to the theory question paper. Students will view this while answering on physical paper.</p>
                </div>
              )}
              
              {!formData.has_obj && formData.has_theory && (
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-200">
                  <strong>Note:</strong> This exam is Theory-Only. Teachers will manually grade physical papers and enter scores via the portal.
                </div>
              )}
            </div>

            {/* Targeting */}
            <div className="bg-gray-50 p-4 rounded-2xl border space-y-4 md:col-span-2">
              <h3 className="font-bold text-gray-800">3. Distribution Targeting</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Forms *</label>
                  <div className="flex gap-4">
                    {[1, 2, 3].map(form => (
                      <label key={form} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border cursor-pointer hover:bg-gray-100">
                        <input 
                          type="checkbox" 
                          checked={formData.selectedForms.includes(form)}
                          onChange={() => toggleForm(form)}
                          className="rounded text-school-green-600"
                        />
                        <span>Form {form}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Departments / Courses</label>
                  <div className="h-32 overflow-y-auto bg-white border rounded-xl p-2 space-y-1">
                    {courses.map(course => (
                      <label key={course.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 cursor-pointer rounded">
                        <input 
                          type="checkbox" 
                          checked={formData.selectedCourses.includes(course.id)}
                          onChange={() => toggleCourse(course.id)}
                          className="rounded text-school-green-600"
                        />
                        <span className="text-sm">{course.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave unchecked to target all departments.</p>
                </div>
              </div>
            </div>
          </div>
          
          {showAiBuilder ? (
            <div className="mt-8">
              <SmartExamBuilder 
                onComplete={(questions) => {
                  setFormData({...formData, extractedQuestions: questions, obj_answer_key: ''});
                  setShowAiBuilder(false);
                }} 
                onCancel={() => setShowAiBuilder(false)} 
              />
            </div>
          ) : (
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-3 bg-school-green-600 text-white font-bold rounded-xl hover:bg-school-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingExam ? 'Update Exam' : 'Create & Distribute Exam'}
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Scheduled General Exams</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 rounded-l-xl">Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Structure</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Start Time & Duration</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{exam.title}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {exam.exam_type || 'General Exam'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {exam.has_obj && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">OBJ</span>}
                        {exam.has_theory && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Theory</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">{exam.subject_name}</td>
                    <td className="px-4 py-3">{exam.class_name} (Form {exam.form})</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{new Date(exam.due_date).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{exam.duration_minutes ? `${exam.duration_minutes} mins` : '60 mins'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(exam.due_date, exam.duration_minutes)}`}>{getStatusLabel(exam.due_date, exam.duration_minutes)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewExam(exam)} className="text-school-green-600 hover:text-school-green-800 text-sm font-bold">View</button>
                        <button onClick={() => handleEdit(exam)} className="text-blue-600 hover:text-blue-800 text-sm font-bold">Edit</button>
                        <button onClick={() => handleDelete(exam.title, exam.due_date)} className="text-red-500 hover:text-red-700 text-sm font-bold">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No general exams scheduled</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewExam && (
        <ViewExamModal
          exam={viewExam}
          allExams={exams}
          onClose={() => setViewExam(null)}
        />
      )}
    </div>
  );
}
