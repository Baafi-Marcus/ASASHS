import React, { useState, useEffect } from 'react';
import db from '../../../lib/neon';
import { toast } from 'react-hot-toast';

interface Election {
  id: number;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  status: 'draft' | 'open' | 'closed';
  created_at: string;
}

interface Position {
  id: number;
  election_id: number;
  title: string;
  max_selections: number;
}

export const AdminElectionManagement: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newElection, setNewElection] = useState({
    name: '',
    description: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const data = await db.getElections();
      setElections(data);
    } catch (error) {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.createElection(newElection);
      toast.success('Election created successfully');
      setIsCreating(false);
      fetchElections();
    } catch (error) {
      toast.error('Failed to create election');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Election Management</h3>
          <p className="text-sm text-gray-600">Create and manage school-wide elections</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-school-green-600 text-white px-4 py-2 rounded-xl hover:bg-school-green-700 transition-all flex items-center space-x-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Election</span>
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-school-cream-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-gray-900">Configure New Election</h4>
            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleCreateElection} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Election Name</label>
              <input
                required
                type="text"
                placeholder="e.g. SRC Elections 2026"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green-500 focus:border-transparent transition-all outline-none"
                value={newElection.name}
                onChange={(e) => setNewElection({...newElection, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
              <input
                type="text"
                placeholder="Brief purpose of the election"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green-500 focus:border-transparent transition-all outline-none"
                value={newElection.description}
                onChange={(e) => setNewElection({...newElection, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Date & Time</label>
              <input
                required
                type="datetime-local"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green-500 focus:border-transparent transition-all outline-none"
                value={newElection.start_time}
                onChange={(e) => setNewElection({...newElection, start_time: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">End Date & Time</label>
              <input
                required
                type="datetime-local"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green-500 focus:border-transparent transition-all outline-none"
                value={newElection.end_time}
                onChange={(e) => setNewElection({...newElection, end_time: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2 rounded-xl bg-school-green-600 text-white hover:bg-school-green-700 transition-all font-medium shadow-md"
              >
                Create Election
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.map((election) => (
          <div key={election.id} className="bg-white rounded-2xl shadow-sm border border-school-cream-200 overflow-hidden hover:shadow-md transition-all group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(election.status)}`}>
                  {election.status}
                </span>
                <button className="text-gray-400 hover:text-school-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
              <h4 className="text-lg font-bold text-gray-900 group-hover:text-school-green-700 transition-colors uppercase">{election.name}</h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2 min-h-[2.5rem]">{election.description || 'No description provided.'}</p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(election.start_time).toLocaleString()} - {new Date(election.end_time).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">Positions: 0</span>
              <button className="text-school-green-600 text-sm font-bold hover:underline">Manage details &rarr;</button>
            </div>
          </div>
        ))}

        {elections.length === 0 && !isCreating && (
          <div className="md:col-span-2 lg:col-span-3 py-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2" />
              </svg>
            </div>
            <h5 className="font-bold text-gray-400">No elections found</h5>
            <p className="text-sm text-gray-400 mt-1">Click "New Election" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
