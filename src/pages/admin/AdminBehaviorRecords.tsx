import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';

interface Student {
  id: number;
  student_id: string;
  surname: string;
  other_names: string;
  current_class_id: number;
  class_name?: string;
}

interface Teacher {
  id: number;
  teacher_id: string;
  surname: string;
  other_names: string;
}

interface BehaviorRecord {
  id: number;
  student_id: number;
  recorded_by: number;
  date: string;
  type: 'Commendation' | 'Warning' | 'Disciplinary';
  description: string;
  status: 'Pending' | 'Approved' | 'Noted';
  is_active: boolean;
  student_name?: string;
  teacher_name?: string;
}

export function AdminBehaviorRecords() {
  const [records, setRecords] = useState<BehaviorRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BehaviorRecord | null>(null);
  
  const [formData, setFormData] = useState({
    student_id: '',
    recorded_by: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Commendation' as 'Commendation' | 'Warning' | 'Disciplinary',
    description: '',
    status: 'Pending' as 'Pending' | 'Approved' | 'Noted'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsData, studentsData, teachersData] = await Promise.all([
        db.getAllBehaviorRecords(),
        db.getStudents({ limit: 1000 }),
        db.getTeachers({ limit: 1000 })
      ]);
      
      setRecords(recordsData as BehaviorRecord[]);
      setStudents(studentsData as Student[]);
      setTeachers(teachersData as Teacher[]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRecord) {
        // Update existing record
        await db.updateBehaviorRecord(editingRecord.id, formData);
        toast.success('Behavior record updated successfully!');
      } else {
        // Create new record
        await db.createBehaviorRecord(formData);
        toast.success('Behavior record created successfully!');
      }
      
      setShowForm(false);
      setEditingRecord(null);
      setFormData({
        student_id: '',
        recorded_by: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Commendation',
        description: '',
        status: 'Pending'
      });
      
      fetchData();
    } catch (error) {
      console.error('Failed to save behavior record:', error);
      toast.error('Failed to save behavior record');
    }
  };

  const handleEdit = (record: BehaviorRecord) => {
    setEditingRecord(record);
    setFormData({
      student_id: record.student_id.toString(),
      recorded_by: record.recorded_by.toString(),
      date: record.date,
      type: record.type,
      description: record.description,
      status: record.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this behavior record?')) {
      try {
        await db.deleteBehaviorRecord(id);
        toast.success('Behavior record deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Failed to delete behavior record:', error);
        toast.error('Failed to delete behavior record');
      }
    }
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.surname} ${student.other_names}` : 'Unknown Student';
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.surname} ${teacher.other_names}` : 'Unknown Teacher';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Commendation': return 'bg-green-100 text-green-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      case 'Disciplinary': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Noted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Behavior Records</h2>
          <p className="text-gray-600">Manage student commendations, warnings, and disciplinary records</p>
        </div>
        <button
          onClick={() => {
            setEditingRecord(null);
            setFormData({
              student_id: '',
              recorded_by: '',
              date: new Date().toISOString().split('T')[0],
              type: 'Commendation',
              description: '',
              status: 'Pending'
            });
            setShowForm(true);
          }}
          className="bg-school-green-600 hover:bg-school-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Record</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {editingRecord ? 'Edit Behavior Record' : 'Add New Behavior Record'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.surname} {student.other_names} ({student.student_id})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recorded By</label>
                <select
                  value={formData.recorded_by}
                  onChange={(e) => setFormData({...formData, recorded_by: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.surname} {teacher.other_names} ({teacher.teacher_id})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  required
                >
                  <option value="Commendation">Commendation</option>
                  <option value="Warning">Warning</option>
                  <option value="Disciplinary">Disciplinary</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-green-500"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Noted">Noted</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-green-500"
                rows={3}
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-school-green-600 hover:bg-school-green-700 text-white px-4 py-2 rounded-lg"
              >
                {editingRecord ? 'Update Record' : 'Create Record'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingRecord(null);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border-2 border-school-cream-200 overflow-hidden">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
            </div>
          ) : records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Recorded By</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {getStudentName(record.student_id)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {getTeacherName(record.recorded_by)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(record.type)}`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                        {record.description}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-3">📋</div>
              <p className="text-gray-500 font-medium">No behavior records found</p>
              <p className="text-gray-400 text-sm">Create a new behavior record to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}