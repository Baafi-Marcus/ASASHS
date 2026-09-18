import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PortalButton } from '../components/PortalButton';

interface Teacher {
  id: number;
  title: string;
  surname: string;
  other_names: string;
  department: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  course_id: number | null;
  is_core: boolean;
}

interface Class {
  id: number;
  class_name: string;
  course_id: number;
  form: number;
  stream: string | null;
}

interface ExistingAssignment {
  id: number;
  subject_id: number;
  class_id: number;
  subject_name: string;
  class_name: string;
}

interface AssignSubjectToTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
  subjects: Subject[];
  classes: Class[];
  existingAssignments?: ExistingAssignment[];
  onAssign: (subjectId: number, classId: number) => Promise<void>;
  onRemoveAssignment?: (assignmentId: number) => Promise<void>;
}

export function AssignSubjectToTeacherModal({ 
  isOpen, 
  onClose, 
  teacher, 
  subjects, 
  classes, 
  existingAssignments = [],
  onAssign,
  onRemoveAssignment
}: AssignSubjectToTeacherModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedSubject = subjects.find(s => s.id === parseInt(selectedSubjectId));

  const filteredClasses = selectedSubject
    ? selectedSubject.is_core
      ? classes
      : classes.filter(c => c.course_id === selectedSubject.course_id)
    : classes;

  const alreadyAssigned = existingAssignments.some(
    a => a.subject_id === parseInt(selectedSubjectId) && a.class_id === parseInt(selectedClassId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubjectId || !selectedClassId) {
      toast.error('Please select both a subject and a class');
      return;
    }
    
    if (alreadyAssigned) {
      toast.error('This subject is already assigned to this teacher for this class');
      return;
    }
    
    setLoading(true);
    try {
      await onAssign(parseInt(selectedSubjectId), parseInt(selectedClassId));
    } catch (error) {
      console.error('Failed to assign subject:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md border border-gray-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Assign Teaching Load</h2>
            <p className="text-xs text-gray-500 mt-0.5">Attach curriculum subjects and classes to instructor</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Teacher banner */}
            <div className="bg-gray-50 p-3.5 rounded-sm border border-gray-200 text-xs">
              <span className="text-gray-400 block uppercase tracking-wider text-[10px] font-semibold">Assigned Faculty</span>
              <h3 className="font-semibold text-gray-900 text-sm mt-0.5">
                {teacher.title} {teacher.surname}, {teacher.other_names}
              </h3>
              <p className="text-gray-500 mt-0.5">{teacher.department}</p>
            </div>
            
            {/* Existing assignments */}
            {existingAssignments.length > 0 && (
              <div className="bg-gray-50/70 p-3 rounded-sm border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Current Active Assignments ({existingAssignments.length})</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {existingAssignments.map((a) => (
                    <div key={a.id} className="text-xs text-gray-700 bg-white p-2 rounded-sm border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span className="font-medium text-gray-900 truncate">{a.subject_name}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-600">{a.class_name}</span>
                      </div>
                      {onRemoveAssignment && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Remove ${a.subject_name} from ${a.class_name}?`)) {
                              await onRemoveAssignment(a.id);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-medium ml-2 shrink-0 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject *</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.is_core ? 'Core' : 'Elective'})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Assigned Class *</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                required
              >
                <option value="">Select Class</option>
                {filteredClasses.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.class_name} (Form {classItem.form}{classItem.stream ? ` ${classItem.stream}` : ''})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="bg-blue-50/60 p-3 rounded-sm border border-blue-200 text-xs text-blue-800">
              Teacher will gain immediate gradebook entry, continuous assessment, and timetable management privileges for this class.
            </div>
          </div>
          
          <div className="flex justify-end gap-2.5 p-4 border-t border-gray-100 bg-gray-50/50">
            <PortalButton
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </PortalButton>
            <PortalButton
              type="submit"
              disabled={loading}
              variant="primary"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Assigning...
                </span>
              ) : (
                'Confirm Assignment'
              )}
            </PortalButton>
          </div>
        </form>
      </div>
    </div>
  );
}