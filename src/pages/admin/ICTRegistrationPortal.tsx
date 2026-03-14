import React, { useState, useEffect } from 'react';
import db from '../../../lib/neon';
import { toast } from 'react-hot-toast';

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
      const data = await db.getStudentsByRegistrationStatus('voter_only');
      setStudents(data);
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
      await db.updateStudentRegistration(selectedStudent.id, formData);
      toast.success('Registration completed successfully');
      setSelectedStudent(null);
      fetchPendingStudents();
    } catch (error) {
      toast.error('Failed to update registration');
    }
  };

  const filteredStudents = students.filter(s => 
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${s.surname} ${s.other_names}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-school-green-600"></div>
      <span className="ml-3 text-gray-600 font-medium">Loading pending registrations...</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Student List Sidebar */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h4 className="font-bold text-gray-900 mb-2">Pending Registrations ({students.length})</h4>
          <div className="relative">
            <input
              type="text"
              placeholder="Search ID or Name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-school-green-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filteredStudents.map(student => (
            <button
              key={student.id}
              onClick={() => handleSelectStudent(student)}
              className={`w-full p-4 text-left transition-colors hover:bg-school-green-50 ${selectedStudent?.id === student.id ? 'bg-school-green-50 border-r-4 border-school-green-600' : ''}`}
            >
              <p className="font-bold text-gray-900 text-sm">{student.surname} {student.other_names}</p>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-school-green-600 font-medium">{student.student_id}</span>
                <span className="text-xs text-gray-400 capitalize">{student.class_name}</span>
              </div>
            </button>
          ))}
          {filteredStudents.length === 0 && (
            <div className="p-8 text-center text-gray-400 italic text-sm">No students found</div>
          )}
        </div>
      </div>

      {/* Completion Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
        {selectedStudent ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-school">Complete Registration</h3>
                <p className="text-sm text-gray-600">Completing profile for <span className="text-school-green-600 font-bold">{selectedStudent.student_id}</span></p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Admission Number</span>
                <span className="font-mono text-sm font-bold bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">{selectedStudent.admission_number}</span>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Date of Birth</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-school-green-500 outline-none transition-all shadow-sm"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Gender</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-school-green-500 outline-none transition-all shadow-sm"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Residential Address</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Street Address, City/Town"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-school-green-500 outline-none transition-all shadow-sm"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Guardian Name</label>
                <input
                  required
                  type="text"
                  placeholder="Full name of Guardian"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-school-green-500 outline-none transition-all shadow-sm"
                  value={formData.guardian_name}
                  onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Guardian Phone</label>
                <input
                  required
                  type="tel"
                  placeholder="+233..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-school-green-500 outline-none transition-all shadow-sm"
                  value={formData.guardian_phone}
                  onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 flex justify-end mt-8 border-t border-gray-50 pt-6">
                <button
                  type="submit"
                  className="px-8 py-3 bg-school-green-600 text-white font-bold rounded-2xl hover:bg-school-green-700 transition-all shadow-lg shadow-school-green-200 flex items-center space-x-2 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Finalize Registration</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="bg-school-cream-50 p-6 rounded-3xl mb-4 border-2 border-dashed border-school-cream-200">
              <svg className="w-16 h-16 text-school-cream-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="font-bold text-xl text-gray-600">Post-Election Registration</p>
            <p className="text-sm text-gray-400 mt-2">Select a student from the pending list to complete their records.</p>
          </div>
        )}
      </div>
    </div>
  );
};
