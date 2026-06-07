import React, { useState, useEffect } from 'react';
import { db } from '../../lib/neon';
import toast from 'react-hot-toast';
import { PortalInput } from '../components/PortalInput';
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
}

export function AssignSubjectToTeacherModal({ 
  isOpen, 
  onClose, 
  teacher, 
  subjects, 
  classes,
  existingAssignments = [],
  onAssign
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-school-green-700 px-6 py-4 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Assign Subject to Teacher</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div className="bg-school-cream-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800">
                {teacher.title} {teacher.surname}, {teacher.other_names}
              </h3>
              <p className="text-sm text-gray-600">{teacher.department}</p>
            </div>
            
            {existingAssignments.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2">Currently Assigned</h4>
                <div className="space-y-1">
                  {existingAssignments.map((a) => (
                    <div key={a.id} className="text-sm text-green-700 flex items-center gap-2">
                      <span>✓</span>
                      <span className="font-medium">{a.subject_name}</span>
                      <span>→</span>
                      <span>{a.class_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
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
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This will assign the selected subject to this teacher for the selected class.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
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
              {loading ? 'Assigning...' : 'Assign Subject'}
            </PortalButton>
          </div>
        </form>
      </div>
    </div>
  );
}