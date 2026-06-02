import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { SmartExamBuilder } from '../../components/SmartExamBuilder';
import { ExtractedQuestion } from '../../lib/aiService';

export function AdminSchoolExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    exam_type: 'End of Semester',
    subject_id: '',
    due_date: '',
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
    selectedForms: [] as number[], 
    selectedCourses: [] as number[], // Empty means ALL courses
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
        exam_type: formData.exam_type,
        subject_id: parseInt(formData.subject_id),
        due_date: formData.due_date,
        max_score: Number(formData.max_score),
        has_obj: formData.has_obj,
        has_theory: formData.has_theory,
        theory_content_url: formData.theory_content_url || undefined,
        obj_answer_key: formData.has_obj && !formData.extractedQuestions.length ? formData.obj_answer_key.toUpperCase().replace(/\s/g, '') : undefined,
        extractedQuestions: formData.extractedQuestions,
        shuffle_questions: formData.shuffle_questions,
        shuffle_options: formData.shuffle_options,
        show_results_immediately: formData.show_results_immediately,
        display_mode: formData.display_mode
      }, classIds);

      toast.success(`Exam distributed successfully to ${classIds.length} classes!`);
      setFormData({ 
        ...formData, title: '', description: '', theory_content_url: '', 
        obj_answer_key: '', extractedQuestions: [] 
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create exams');
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
        <h2 className="text-2xl font-bold mb-6">Schedule School-Wide Exam</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input 
                  type="datetime-local" 
                  value={formData.due_date} 
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
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
                {isSubmitting ? 'Distributing Exam...' : 'Create & Distribute Exam'}
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
                  <th className="px-4 py-3">Due Date</th>
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
                    <td className="px-4 py-3">{new Date(exam.due_date).toLocaleString()}</td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No general exams scheduled</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
