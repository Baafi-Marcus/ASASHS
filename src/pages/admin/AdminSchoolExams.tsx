import React, { useState, useEffect, useMemo, useContext } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../AuthContext';
import { SmartExamBuilder } from '../../components/SmartExamBuilder';
import { ExtractedQuestion, aiService } from '../../lib/aiService';
import { parseDate, getScheduleStatus, getStatusLabel, getStatusColor } from '../../lib/dates';
import { MathText } from '../../components/MathText';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { PortalButton } from '../../components/PortalButton';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md border border-gray-200 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">{exam.title}</h2>
              <span className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold ${getStatusColor(exam.due_date, exam.duration_minutes)}`}>
                {status === 'ended' ? 'Concluded' : status === 'upcoming' ? 'Scheduled' : 'In Session'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">School-wide official examination schedule & parameters</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 bg-gray-50/70 p-4 rounded-sm border border-gray-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Exam Category</span>
              <p className="font-semibold text-gray-900 mt-0.5">{exam.exam_type || 'General Assessment'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Curriculum Subject</span>
              <p className="font-semibold text-gray-900 mt-0.5">{exam.subject_name}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Duration</span>
              <p className="font-semibold text-gray-900 mt-0.5 tabular-nums">{exam.duration_minutes || 60} mins</p>
            </div>
            {start && (
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Scheduled Start</span>
                <p className="font-semibold text-gray-900 mt-0.5 tabular-nums">{start.toLocaleString()}</p>
              </div>
            )}
            {end && (
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Scheduled Finish</span>
                <p className="font-semibold text-gray-900 mt-0.5 tabular-nums">{end.toLocaleString()}</p>
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Maximum Points</span>
              <p className="font-semibold text-gray-900 mt-0.5 tabular-nums">{exam.max_score || 100} pts</p>
            </div>
            <div className="col-span-2 md:col-span-3 pt-2 border-t border-gray-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Target Classes</span>
              <p className="font-semibold text-gray-800 mt-0.5">{targetClasses.join(', ') || 'School-wide'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Assessment Components:</span>
            {exam.has_obj && (
              <span className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-sm text-xs font-semibold border border-green-200">
                Objective (OBJ)
              </span>
            )}
            {exam.has_theory && (
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-sm text-xs font-semibold border border-purple-200">
                Written Theory
              </span>
            )}
          </div>

          {exam.instructions && (
            <div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Official Candidate Instructions</span>
              <div className="text-xs text-gray-700 bg-gray-50 p-3.5 rounded-sm border border-gray-200 whitespace-pre-wrap leading-relaxed">
                {exam.instructions}
              </div>
            </div>
          )}

          {(exam.shuffle_questions || exam.shuffle_options) && (
            <div className="flex gap-4 text-xs font-medium text-gray-600 bg-gray-50 p-3 rounded-sm border border-gray-200">
              {exam.shuffle_questions && (
                <span className="flex items-center gap-1.5 text-school-green-700">
                  <CheckCircleIcon className="w-4 h-4" /> Question Order Randomization
                </span>
              )}
              {exam.shuffle_options && (
                <span className="flex items-center gap-1.5 text-school-green-700">
                  <CheckCircleIcon className="w-4 h-4" /> Option Order Randomization
                </span>
              )}
            </div>
          )}

          {loadingQ && (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-school-green-200 border-t-school-green-600" />
            </div>
          )}

          {questions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Configured Examination Questions
                </span>
                <span className="text-xs text-gray-500 tabular-nums">({questions.length} total questions)</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-sm p-2 bg-gray-50/50">
                {questions.map((q: any, i: number) => (
                  <div key={q.id || i} className="bg-white p-3 rounded-sm border border-gray-200 text-xs">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-bold text-school-green-700 mr-2 tabular-nums">Q{i + 1}.</span>
                      <span className="text-[11px] text-gray-400 tabular-nums font-mono">{q.points || 1} mark(s)</span>
                    </div>
                    <div className="text-gray-800">
                      <MathText text={q.question_text} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Dismiss
          </button>
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
  const { user } = useContext(AuthContext);
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
    allow_offline: false,
    ca_pdf_url: '',
    ca_weight_obj: 40,
    ca_weight_theory: 60,
    ca_instructions: '',
    ca_columns: [
      { id: 'col_obj', name: 'Auto-Graded Objective (APK)', weight: 40, is_auto_obj: true },
      { id: 'col_theory', name: 'Manual Written Theory', weight: 60, is_auto_obj: false }
    ],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingCA, setIsAnalyzingCA] = useState(false);
  const [showAiBuilder, setShowAiBuilder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredExams = useMemo(() => {
    let list = exams;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => 
        e.title?.toLowerCase().includes(q) ||
        e.subject_name?.toLowerCase().includes(q) ||
        e.exam_type?.toLowerCase().includes(q) ||
        e.class_name?.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
  }, [exams, searchQuery]);

  const paginatedExams = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredExams.slice(start, start + pageSize);
  }, [filteredExams, page]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

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
      allow_offline: exam.allow_offline ?? false,
      ca_pdf_url: exam.ca_pdf_url || '',
      ca_weight_obj: exam.ca_weight_obj ?? 40,
      ca_weight_theory: exam.ca_weight_theory ?? 60,
      ca_instructions: exam.ca_instructions || '',
      ca_columns: exam.ca_columns_json ? JSON.parse(exam.ca_columns_json) : [
        { id: 'col_obj', name: 'Auto-Graded Objective (APK)', weight: 40, is_auto_obj: true },
        { id: 'col_theory', name: 'Manual Written Theory', weight: 60, is_auto_obj: false }
      ],
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
      selectedForms: [], selectedCourses: [], allow_offline: false,
      ca_pdf_url: '', ca_weight_obj: 40, ca_weight_theory: 60, ca_instructions: '',
      ca_columns: [
        { id: 'col_obj', name: 'Auto-Graded Objective (APK)', weight: 40, is_auto_obj: true },
        { id: 'col_theory', name: 'Manual Written Theory', weight: 60, is_auto_obj: false }
      ],
    });
  };

  const handleDelete = async (title: string, dueDate: string) => {
    if (window.confirm(`Are you sure you want to delete the exam "${title}"?`)) {
      try {
        await db.deleteGeneralExam(title, dueDate);
        toast.success('Exam deleted successfully');
        db.logAuditEvent({
          actor_id: user?.user_id || 'unknown',
          actor_name: user?.full_name || 'Unknown',
          action: 'delete',
          entity_type: 'exam',
          entity_id: title,
          details: `Deleted exam "${title}" (due: ${dueDate})`
        });
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
      
      if (editingExam) {
        await db.deleteGeneralExam(editingExam.title, editingExam.due_date);
      }

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
        max_attempts: formData.max_attempts,
        allow_offline: formData.allow_offline,
        ca_pdf_url: formData.ca_pdf_url || undefined,
        ca_weight_obj: Number(formData.ca_weight_obj) || 40,
        ca_weight_theory: Number(formData.ca_weight_theory) || 60,
        ca_instructions: formData.ca_instructions || undefined,
        ca_columns_json: JSON.stringify(formData.ca_columns || [
          { id: 'col_obj', name: 'Auto-Graded Objective (APK)', weight: Number(formData.ca_weight_obj) || 40, is_auto_obj: true },
          { id: 'col_theory', name: 'Manual Written Theory', weight: Number(formData.ca_weight_theory) || 60, is_auto_obj: false }
        ]),
      }, classIds);

      toast.success(editingExam ? 'Exam updated successfully!' : `Exam distributed successfully to ${classIds.length} classes!`);
      db.logAuditEvent({
        actor_id: user?.user_id || 'unknown',
        actor_name: user?.full_name || 'Unknown',
        action: editingExam ? 'update' : 'create',
        entity_type: 'exam',
        entity_id: formData.title,
        details: `${editingExam ? 'Updated' : 'Created'} exam "${formData.title}" for ${classIds.length} class(es)`
      });
      cancelEdit();
      fetchData();
    } catch (error) {
      toast.error(editingExam ? 'Failed to update exam' : 'Failed to create exams');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadAndAnalyzeCA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingCA(true);
    const toastId = toast.loading('AI analyzing uploaded Continuous Assessment sheet...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const analysis = await aiService.analyzeCASheetTemplate({
            image: file.type.includes('image') || file.type.includes('pdf') ? file : undefined,
            text: `${file.name} - Continuous Assessment Score Sheet Template`
          });

          setFormData(prev => ({
            ...prev,
            ca_pdf_url: dataUrl,
            ca_weight_obj: analysis.ca_weight_obj || 40,
            ca_weight_theory: analysis.ca_weight_theory || 60,
            ca_instructions: analysis.ca_instructions || prev.ca_instructions,
            ca_columns: analysis.ca_columns && analysis.ca_columns.length > 0 ? analysis.ca_columns : prev.ca_columns
          }));

          toast.success(`CA sheet analyzed! Detected ${analysis.ca_columns?.length || 2} grading columns.`, { id: toastId });
        } catch (err) {
          setFormData(prev => ({ ...prev, ca_pdf_url: dataUrl }));
          toast.success('File uploaded! You can manually adjust weights below.', { id: toastId });
        } finally {
          setIsAnalyzingCA(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to process uploaded file', { id: toastId });
      setIsAnalyzingCA(false);
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
      {/* Schedule / Edit Exam Form Card */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {editingExam ? `Edit Scheduled Exam: ${editingExam.title}` : 'Schedule School-Wide Examination'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure parameters, weighting, question banks, and target cohorts
            </p>
          </div>
          {editingExam && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleCreate} className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: Exam Details */}
            <div className="bg-gray-50/60 p-4 rounded-sm border border-gray-200 space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <AcademicCapIcon className="w-4 h-4 text-school-green-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">1. Exam Parameters</h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Exam Title *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs focus:ring-1 focus:ring-school-green-500 focus:border-school-green-500 bg-white"
                  placeholder="e.g. End of Semester Core Mathematics"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Candidate Instructions & Proctoring Rules</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs focus:ring-1 focus:ring-school-green-500 focus:border-school-green-500 bg-white"
                  rows={3}
                  placeholder="List instructions (e.g. 1. Answer all objective questions. 2. Mobile devices strictly prohibited.)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Exam Category</label>
                  <select 
                    value={formData.exam_type} 
                    onChange={(e) => setFormData({...formData, exam_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs focus:ring-1 focus:ring-school-green-500 focus:border-school-green-500 bg-white"
                  >
                    <option value="End of Semester">End of Semester</option>
                    <option value="Mid-Semester">Mid-Semester</option>
                    <option value="Intervention">Intervention Exam</option>
                    <option value="Mock Exam">Mock Exam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Curriculum Subject *</label>
                  <select 
                    value={formData.subject_id} 
                    onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs focus:ring-1 focus:ring-school-green-500 focus:border-school-green-500 bg-white"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Scheduled Date & Time *</label>
                  <input 
                    type="datetime-local" 
                    value={formData.due_date} 
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs focus:ring-1 focus:ring-school-green-500 focus:border-school-green-500 bg-white tabular-nums"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.duration_minutes} 
                    onChange={(e) => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs focus:ring-1 focus:ring-school-green-500 focus:border-school-green-500 bg-white tabular-nums"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Exam Structure */}
            <div className="bg-gray-50/60 p-4 rounded-sm border border-gray-200 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4 text-school-green-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">2. Assessment Sections</h3>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-medium text-gray-700">
                    <input 
                      type="checkbox" 
                      checked={formData.has_obj}
                      onChange={(e) => setFormData({...formData, has_obj: e.target.checked})}
                      className="rounded-xs text-school-green-700 focus:ring-school-green-500"
                    />
                    <span>Objective (OBJ)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-medium text-gray-700">
                    <input 
                      type="checkbox" 
                      checked={formData.has_theory}
                      onChange={(e) => setFormData({...formData, has_theory: e.target.checked})}
                      className="rounded-xs text-school-green-700 focus:ring-school-green-500"
                    />
                    <span>Theory</span>
                  </label>
                </div>
              </div>
              
              {formData.has_obj && (
                <div className="p-3.5 bg-white rounded-sm border border-gray-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-800">Objective Section Setup</span>
                    {formData.extractedQuestions.length === 0 && (
                      <button 
                        type="button"
                        onClick={() => setShowAiBuilder(true)}
                        className="px-2.5 py-1 bg-school-green-50 text-school-green-700 border border-school-green-200 rounded-sm text-xs font-medium hover:bg-school-green-100 transition-colors"
                      >
                        Launch Smart Question Builder
                      </button>
                    )}
                  </div>
                  
                  {formData.extractedQuestions.length > 0 ? (
                    <div className="bg-green-50/60 p-3 rounded-sm border border-green-200 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-green-900 tabular-nums">
                          {formData.extractedQuestions.length} Questions Loaded
                        </p>
                        <p className="text-[11px] text-green-700">Online delivery with auto-scoring enabled.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, extractedQuestions: []})}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Reset Questions
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Standard Answer Key (Fallback)</label>
                      <input 
                        type="text" 
                        value={formData.obj_answer_key} 
                        onChange={(e) => setFormData({...formData, obj_answer_key: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-sm font-mono uppercase tracking-widest text-xs"
                        placeholder="e.g. ABCDABCDA..."
                      />
                      <p className="text-[11px] text-gray-500 mt-1">If not using the Question Builder, input ABCD keys for digital optical marking.</p>
                    </div>
                  )}

                  {formData.extractedQuestions.length > 0 && (
                    <div className="pt-3 border-t border-gray-100 space-y-2.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Candidate Delivery Settings</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" checked={formData.shuffle_questions} onChange={e => setFormData({...formData, shuffle_questions: e.target.checked})} className="rounded-xs text-school-green-700"/>
                          <span className="text-gray-700">Shuffle Questions</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" checked={formData.shuffle_options} onChange={e => setFormData({...formData, shuffle_options: e.target.checked})} className="rounded-xs text-school-green-700"/>
                          <span className="text-gray-700">Shuffle Options</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" checked={formData.show_results_immediately} onChange={e => setFormData({...formData, show_results_immediately: e.target.checked})} className="rounded-xs text-school-green-700"/>
                          <span className="text-gray-700">Instant Score Display</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" checked={formData.allow_offline} onChange={e => setFormData({...formData, allow_offline: e.target.checked})} className="rounded-xs text-school-green-700"/>
                          <span className="text-gray-700">Allow Offline Mode</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] text-gray-600 mb-1 block">Display Layout</label>
                          <select
                            value={formData.display_mode}
                            onChange={e => setFormData({...formData, display_mode: e.target.value})}
                            className="w-full border border-gray-300 rounded-sm px-2 py-1 text-xs"
                          >
                            <option value="all_at_once">All at Once (Continuous)</option>
                            <option value="one_by_one">One by One (Paged)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-600 mb-1 block">Permitted Attempts</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.max_attempts}
                            onChange={e => setFormData({...formData, max_attempts: Math.max(1, parseInt(e.target.value) || 1)})}
                            className="w-full border border-gray-300 rounded-sm px-2 py-1 text-xs tabular-nums"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {formData.has_theory && (
                <div className="p-3.5 bg-white rounded-sm border border-gray-200">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Theory Paper Link (Cloud Storage / PDF)</label>
                  <input 
                    type="url" 
                    value={formData.theory_content_url} 
                    onChange={(e) => setFormData({...formData, theory_content_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs"
                    placeholder="https://drive.google.com/.../theory_paper.pdf"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Candidates view this paper on-screen and respond in designated answer booklets.</p>
                </div>
              )}
              
              {!formData.has_obj && formData.has_theory && (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-sm text-xs border border-amber-200">
                  <strong>Theory-Only Format:</strong> Teachers enter grading scores directly into the institutional score sheets.
                </div>
              )}
            </div>

            {/* Continuous Assessment (CA) Policy Setup */}
            <div className="bg-school-green-50/40 p-4 sm:p-5 rounded-sm border border-school-green-200 space-y-4 md:col-span-2">
              <div className="flex items-center justify-between pb-2 border-b border-school-green-200/60">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-school-green-950 flex items-center gap-2">
                    <AdjustmentsHorizontalIcon className="w-4 h-4 text-school-green-800" />
                    3. Continuous Assessment (CA) & Score Sheet Policy
                  </h3>
                  <p className="text-xs text-school-green-800 mt-0.5">
                    Defines weighting rules for auto-graded objective questions and manual theory scoring columns
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-sm border border-gray-200 shadow-2xs">
                <div className="md:col-span-1 space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Official Template File</label>
                  <div className="space-y-2">
                    <label className="cursor-pointer bg-school-green-700 hover:bg-school-green-800 text-white px-3 py-2 rounded-sm text-xs font-medium flex items-center justify-center gap-2 transition-colors">
                      <ArrowUpTrayIcon className="w-4 h-4" />
                      <span>Upload Sheet Template</span>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleUploadAndAnalyzeCA}
                        className="hidden"
                        disabled={isAnalyzingCA}
                      />
                    </label>
                    {isAnalyzingCA && (
                      <p className="text-xs text-school-green-700 font-medium animate-pulse">
                        Analyzing template structure...
                      </p>
                    )}
                    <input 
                      type="url" 
                      value={formData.ca_pdf_url} 
                      onChange={(e) => setFormData({...formData, ca_pdf_url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs font-mono"
                      placeholder="Or enter template URL: https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">OBJ Weighting (%)</label>
                  <input 
                    type="number" 
                    min="0" max="100"
                    value={formData.ca_weight_obj} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData({...formData, ca_weight_obj: val, ca_weight_theory: Math.max(0, 100 - val)});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs font-bold text-green-700 tabular-nums"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Weight allocated to digital objective scores.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Theory Weighting (%)</label>
                  <input 
                    type="number" 
                    min="0" max="100"
                    value={formData.ca_weight_theory} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData({...formData, ca_weight_theory: val, ca_weight_obj: Math.max(0, 100 - val)});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs font-bold text-purple-700 tabular-nums"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Weight allocated to handwritten manual marking.</p>
                </div>

                <div className="md:col-span-3 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Teacher Instructions for Assessment Submission</label>
                  <input 
                    type="text" 
                    value={formData.ca_instructions} 
                    onChange={(e) => setFormData({...formData, ca_instructions: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs"
                    placeholder="e.g. Download the official CA sheet, record marks from booklets, and verify Attendance PINs before entry."
                  />
                </div>

                {/* Dynamic Grading Columns */}
                <div className="md:col-span-3 pt-3 border-t border-gray-100 bg-gray-50/60 p-3 rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Assessment Grading Columns ({formData.ca_columns.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newCol = {
                          id: `col_${Date.now()}`,
                          name: 'New Assessment Section',
                          weight: 10,
                          is_auto_obj: false
                        };
                        setFormData({ ...formData, ca_columns: [...formData.ca_columns, newCol] });
                      }}
                      className="px-2.5 py-1 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors"
                    >
                      + Add Section Column
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.ca_columns.map((col, idx) => (
                      <div key={col.id || idx} className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-sm border border-gray-200 text-xs">
                        <span className={col.is_auto_obj ? "font-semibold text-green-700 tabular-nums" : "font-semibold text-purple-700 tabular-nums"}>
                          {col.name} ({col.weight}%)
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1 py-0.5 rounded-xs bg-gray-100 text-gray-600">
                          {col.is_auto_obj ? 'Auto-OBJ' : 'Manual'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              ca_columns: formData.ca_columns.filter((_, i) => i !== idx)
                            });
                          }}
                          className="text-gray-400 hover:text-red-600 font-bold ml-1 transition-colors"
                          title="Remove column"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Target Cohorts */}
            <div className="bg-gray-50/60 p-4 rounded-sm border border-gray-200 space-y-3.5 md:col-span-2">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <CalendarDaysIcon className="w-4 h-4 text-school-green-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">4. Target Distribution & Cohorts</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Target Forms *</label>
                  <div className="flex gap-3">
                    {[1, 2, 3].map(form => (
                      <label key={form} className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-sm border border-gray-200 cursor-pointer hover:bg-gray-50 text-xs font-medium">
                        <input 
                          type="checkbox" 
                          checked={formData.selectedForms.includes(form)}
                          onChange={() => toggleForm(form)}
                          className="rounded-xs text-school-green-700 focus:ring-school-green-500"
                        />
                        <span>Form {form}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Target Academic Programmes (Optional)</label>
                  <div className="h-32 overflow-y-auto bg-white border border-gray-200 rounded-sm p-2 space-y-1 text-xs">
                    {courses.map(course => (
                      <label key={course.id} className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 cursor-pointer rounded-xs">
                        <input 
                          type="checkbox" 
                          checked={formData.selectedCourses.includes(course.id)}
                          onChange={() => toggleCourse(course.id)}
                          className="rounded-xs text-school-green-700 focus:ring-school-green-500"
                        />
                        <span className="text-gray-800">{course.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Leave blank to distribute across all academic programmes.</p>
                </div>
              </div>
            </div>
          </div>
          
          {showAiBuilder ? (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <SmartExamBuilder 
                onComplete={(questions) => {
                  setFormData({...formData, extractedQuestions: questions, obj_answer_key: ''});
                  setShowAiBuilder(false);
                }} 
                onCancel={() => setShowAiBuilder(false)} 
              />
            </div>
          ) : (
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <PortalButton
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-school-green-700 text-white font-medium text-xs rounded-sm hover:bg-school-green-800 transition-colors shadow-2xs"
              >
                {isSubmitting ? 'Saving Examination...' : editingExam ? 'Update Examination Schedule' : 'Distribute School Examination'}
              </PortalButton>
            </div>
          )}
        </form>
      </div>

      {/* Scheduled Exams List Card */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Scheduled Examination Directory</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage existing cohort examinations, proctoring schedules, and answer keys</p>
          </div>
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search examinations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-sm text-xs focus:ring-1 focus:ring-school-green-500 focus:border-school-green-500 bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingSkeleton variant="table" rows={6} columns={8} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Exam Title</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Structure</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Cohort</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Schedule & Duration</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {paginatedExams.map((exam, i) => (
                    <tr key={exam.id || i} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{exam.title}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm text-[11px] font-medium">
                          {exam.exam_type || 'General Exam'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {exam.has_obj && <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-sm text-[10px] font-semibold">OBJ</span>}
                          {exam.has_theory && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-sm text-[10px] font-semibold">Theory</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{exam.subject_name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {exam.class_name} <span className="text-gray-400 tabular-nums font-mono">(Form {exam.form})</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 tabular-nums">{new Date(exam.due_date).toLocaleString()}</div>
                        <div className="text-[11px] text-gray-400 tabular-nums">{exam.duration_minutes ? `${exam.duration_minutes} mins` : '60 mins'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold ${getStatusColor(exam.due_date, exam.duration_minutes)}`}>
                          {getStatusLabel(exam.due_date, exam.duration_minutes)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewExam(exam)}
                            className="p-1 text-gray-500 hover:text-school-green-700 hover:bg-gray-100 rounded-xs transition-colors"
                            title="View Exam Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(exam)}
                            className="p-1 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-xs transition-colors"
                            title="Edit Exam"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exam.title, exam.due_date)}
                            className="p-1 text-gray-500 hover:text-red-700 hover:bg-gray-100 rounded-xs transition-colors"
                            title="Delete Exam"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredExams.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-xs">
                        {searchQuery ? 'No examinations match your search criteria.' : 'No general examinations currently scheduled.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
                <span className="text-xs text-gray-500 tabular-nums">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredExams.length)} of {filteredExams.length} examinations
                </span>
                <div className="flex gap-1.5">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-2.5 py-1 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-2.5 py-1 border rounded-sm text-xs font-medium tabular-nums ${
                          pageNum === page
                            ? 'bg-school-green-700 text-white border-school-green-700'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-2.5 py-1 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
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
