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
  is_core: boolean;
}

interface Class {
  id: number;
  class_name: string;
  form: number;
  stream: string | null;
}

interface AssignSubjectToTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
  subjects: Subject[];
  classes: Class[];
  onAssign: (subjectId: number, classId: number) => Promise<void>;
}

export function AssignSubjectToTeacherModal({ 
  isOpen, 
  onClose, 
  teacher, 
  subjects, 
  classes,
  onAssign
}: AssignSubjectToTeacherModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubjectId || !selectedClassId) {
      toast.error('Please select both a subject and a class');
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
                {classes.map((classItem) => (
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