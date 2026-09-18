import React, { useState, useEffect } from 'react';
import db from '../../../lib/neon';
import { toast } from 'react-hot-toast';
import {
  IdentificationIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  UserCircleIcon,
  PhoneIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { PortalButton } from '../../components/PortalButton';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

interface Student {
  id: number;
  student_id: string;
  admission_number: string;
  surname: string;
  other_names: string;
  class_name: string;
  course_name: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  guardian_name?: string;
  guardian_phone?: string;
}

export const ICTRegistrationPortal: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date_of_birth: '',
    gender: 'Male',
    address: '',
    guardian_name: '',
    guardian_phone: ''
  });

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      const data = await db.getStudentsByRegistrationStatus('voter_only');
      setStudents(data || []);
    } catch (error) {
      toast.error('Failed to load pending registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '',
      gender: student.gender || 'Male',
      address: student.address || '',
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || ''
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      setIsSubmitting(true);
      await db.updateStudentRegistration(selectedStudent.id, formData);
      toast.success('Registration dossier finalized');
      setSelectedStudent(null);
      fetchPendingStudents();
    } catch (error) {
      toast.error('Failed to commit student registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${s.surname} ${s.other_names}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="stats" />
        <LoadingSkeleton variant="table" rows={6} columns={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">ICT Desk: Incomplete Registrations Finalizer</h2>
          <p className="text-xs text-gray-500 mt-0.5">Finalize demographic and guardian records for students provisioned via express voter onboarding</p>
        </div>
        <span className="text-xs font-semibold text-gray-700 tabular-nums font-mono">
          {students.length} pending completion
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-md shadow-xs border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 bg-gray-50/70 border-b border-gray-200 space-y-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Pending Candidates ({students.length})
            </h4>
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search index ID or name..."
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-sm text-xs bg-white focus:ring-1 focus:ring-school-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => handleSelectStudent(student)}
                className={`w-full p-3.5 text-left transition-colors text-xs hover:bg-gray-50 ${
                  selectedStudent?.id === student.id ? 'bg-school-green-50/60 border-l-4 border-school-green-700' : ''
                }`}
              >
                <p className="font-semibold text-gray-900">{student.surname}, {student.other_names}</p>
                <div className="flex justify-between items-center mt-1 text-[11px]">
                  <span className="font-mono text-school-green-800 font-medium tabular-nums">{student.student_id}</span>
                  <span className="text-gray-500">{student.class_name || 'General'}</span>
                </div>
              </button>
            ))}
            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-xs">
                No pending registrations found matching filter.
              </div>
            )}
          </div>
        </div>

        {/* Completion Form */}
        <div className="lg:col-span-2 bg-white rounded-md shadow-xs border border-gray-200 p-5 sm:p-6 min-h-[600px] flex flex-col justify-between">
          {selectedStudent ? (
            <div className="space-y-6 text-xs">
              <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Complete Profile: {selectedStudent.surname}, {selectedStudent.other_names}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Assigned Index: <span className="font-mono font-bold text-school-green-800 tabular-nums">{selectedStudent.student_id}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Admission Code</span>
                  <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-0.5 rounded-sm border border-gray-200 tabular-nums">
                    {selectedStudent.admission_number}
                  </span>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <input
                      required
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white tabular-nums"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Residential Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Street name, Residential Landmark, Town/City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Guardian / Parent Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Mary Mensah"
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white"
                      value={formData.guardian_name}
                      onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Guardian Emergency Telephone *</label>
                    <input
                      required
                      type="tel"
                      placeholder="+233..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white tabular-nums"
                      value={formData.guardian_phone}
                      onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <PortalButton
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-school-green-700 text-white font-medium rounded-sm hover:bg-school-green-800 transition-colors shadow-2xs"
                  >
                    {isSubmitting ? 'Finalizing...' : 'Finalize Registration'}
                  </PortalButton>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-16">
              <IdentificationIcon className="w-12 h-12 text-gray-300 mb-2" />
              <p className="font-semibold text-sm text-gray-700">No Student Selected</p>
              <p className="text-xs text-gray-400 mt-0.5">Select a student from the pending list on the left to complete their institutional registration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ICTRegistrationPortal;
