import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';

interface BehaviorRecord {
  id: number;
  date: string;
  type: 'Commendation' | 'Warning' | 'Disciplinary';
  description: string;
  status: 'Approved' | 'Pending' | 'Noted';
}

interface StudentBehaviorProps {
  studentId: number;
}

export const StudentBehavior: React.FC<StudentBehaviorProps> = ({ studentId }) => {
  const [records, setRecords] = useState<BehaviorRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBehaviorRecords();
  }, []);

  const fetchBehaviorRecords = async () => {
    try {
      setLoading(true);
      const data = await db.getStudentBehaviorRecords(studentId);
      setRecords(data as BehaviorRecord[]);
    } catch (error) {
      console.error('Failed to fetch behavior records:', error);
      toast.error('Failed to load behavior records');
      
      // Fallback to mock data on error
      setRecords([
        {
          id: 1,
          date: '2025-02-15',
          type: 'Warning',
          description: 'Late submission of assignment',
          status: 'Noted'
        },
        {
          id: 2,
          date: '2025-03-10',
          type: 'Commendation',
          description: 'Excellent performance in Physics',
          status: 'Approved'
        },
        {
          id: 3,
          date: '2025-04-05',
          type: 'Disciplinary',
          description: 'Disruptive behavior in class',
          status: 'Pending'
        }
      ]);
    } finally {
      setLoading(false);
    }
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
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Behavior & Conduct Records</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(record.type)}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.description}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
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
            <p className="text-gray-400 text-sm">Your behavior records will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};