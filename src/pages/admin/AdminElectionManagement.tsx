import React, { useState, useEffect } from 'react';
import db from '../../../lib/neon';
import { toast } from 'react-hot-toast';

interface Election {
  id: number;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  status: 'draft' | 'open' | 'paused' | 'closed';
  created_at: string;
}

interface Position {
  id: number;
  election_id: number;
  title: string;
  max_selections: number;
}

interface Candidate {
  id: number;
  position_id: number;
  display_name: string;
  manifesto: string | null;
  image_url: string | null;
  student_id: number | null;
  surname?: string;
  other_names?: string;
  student_class?: string;
}

interface StudentRecord {
  id: number;
  surname: string;
  other_names: string;
  student_id: string;
  class_name: string;
}

export const AdminElectionManagement: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [activeTab, setActiveTab] = useState<'positions' | 'candidates' | 'results'>('positions');
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Record<number, Candidate[]>>({});
  const [stats, setStats] = useState<{ total: number; voted: number; percentage: number } | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<StudentRecord[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [newElection, setNewElection] = useState({
    name: '',
    description: '',
    start_time: '',
    end_time: ''
  });

  const [newPosition, setNewPosition] = useState({ title: '', max_selections: 1 });
  const [newCandidate, setNewCandidate] = useState<{
    position_id: number;
    student_id: number | '';
    display_name: string;
    manifesto: string;
    image_url: string;
  }>({ position_id: 0, student_id: '', display_name: '', manifesto: '', image_url: '' });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCandidate(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editSchedule, setEditSchedule] = useState({ start_time: '', end_time: '' });

  useEffect(() => {
    fetchElections();
    fetchAllStudents();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchElectionDetails(selectedElection.id);
      const startTime = String(selectedElection.start_time);
      const endTime = String(selectedElection.end_time);
      setEditSchedule({
        start_time: startTime.includes('T') ? startTime.slice(0, 16) : startTime.split('.')[0].slice(0, 16).replace(' ', 'T'),
        end_time: endTime.includes('T') ? endTime.slice(0, 16) : endTime.split('.')[0].slice(0, 16).replace(' ', 'T')
      });
    }
  }, [selectedElection]);

  const handleUpdateStatus = async (status: 'open' | 'closed' | 'draft' | 'paused') => {
    if (!selectedElection) return;
    try {
      await db.updateElectionStatus(selectedElection.id, status);
      toast.success(`Election ${status === 'open' ? 'started' : status === 'paused' ? 'paused' : status === 'closed' ? 'ended' : 'moved to draft'}`);
      const updated = { ...selectedElection, status };
      setSelectedElection(updated);
      fetchElections();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

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

  const fetchAllStudents = async () => {
    try {
      // Use the existing getStudents method with a high limit to get all students for the dropdown
      const data = await db.getStudents({ limit: 1000 }); 
      setAllStudents(data);
    } catch (error) {
      console.error('Failed to load students for candidate selection');
    }
  };

  const fetchElectionDetails = async (id: number) => {
    try {
      const posData = await db.getPositions(id);
      setPositions(posData);
      
      const candData: Record<number, Candidate[]> = {};
      for (const pos of posData) {
        candData[pos.id] = await db.getCandidates(pos.id);
      }
      setCandidates(candData);

      const statsData = await db.getParticipationStats(id);
      setStats(statsData);

      const resultsData = await db.getElectionResults(id);
      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching election details:', error);
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

  const handleDeleteElection = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the election "${name}"? This action cannot be undone.`)) return;
    try {
      await db.deleteElection(id);
      toast.success('Election deleted');
      fetchElections();
    } catch (error) {
      toast.error('Failed to delete election');
    }
  };

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElection) return;
    try {
      await db.createPosition({ election_id: selectedElection.id, ...newPosition });
      toast.success('Position added');
      setNewPosition({ title: '', max_selections: 1 });
      fetchElectionDetails(selectedElection.id);
    } catch (error) {
      toast.error('Failed to add position');
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.position_id) return;
    try {
      await db.createCandidate({
        ...newCandidate,
        student_id: newCandidate.student_id === '' ? undefined : newCandidate.student_id
      });
      toast.success('Candidate registered');
      setNewCandidate({ position_id: 0, student_id: '', display_name: '', manifesto: '', image_url: '' });
      if (selectedElection) fetchElectionDetails(selectedElection.id);
    } catch (error) {
      toast.error('Failed to add candidate');
    }
  };

  const handleStudentSelect = (studentId: string) => {
    if (studentId === '') {
      setNewCandidate({ ...newCandidate, student_id: '', display_name: '' });
      return;
    }
    const student = allStudents.find(s => s.id === parseInt(studentId));
    if (student) {
      setNewCandidate({ 
        ...newCandidate, 
        student_id: student.id, 
        display_name: `${student.surname} ${student.other_names}`
      });
    }
  };

  const handleUpdateSchedule = async () => {
    if (!selectedElection) return;
    try {
      await db.updateElectionSchedule(selectedElection.id, editSchedule.start_time, editSchedule.end_time);
      toast.success('Election schedule updated');
      const updated = { ...selectedElection, ...editSchedule };
      setSelectedElection(updated);
      fetchElections();
      setIsEditingSchedule(false);
    } catch (error) {
      toast.error('Failed to update schedule');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-school-green-600"></div>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (selectedElection) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <button 
          onClick={() => setSelectedElection(null)}
          className="flex items-center text-gray-500 hover:text-school-green-600 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Elections
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{selectedElection.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(selectedElection.status)}`}>
                  {selectedElection.status}
                </span>
              </div>
              <p className="text-gray-500 font-medium">{selectedElection.description || 'Managing school leadership elections.'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setIsEditingSchedule(!isEditingSchedule)}
                className="px-6 py-2 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all border border-gray-200 flex items-center space-x-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{isEditingSchedule ? 'Cancel Editing' : 'Edit Schedule'}</span>
              </button>

              {selectedElection.status === 'draft' && (
                <button 
                  onClick={() => handleUpdateStatus('open')}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  <span>Start Election</span>
                </button>
              )}
              {selectedElection.status === 'open' && (
                <>
                  <button 
                    onClick={() => handleUpdateStatus('paused')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Pause</span>
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('closed')}
                    className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-200"
                  >
                    End Election
                  </button>
                </>
              )}
              {selectedElection.status === 'paused' && (
                <button 
                  onClick={() => handleUpdateStatus('open')}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  <span>Resume Election</span>
                </button>
              )}
              {selectedElection.status === 'closed' && (
                <button 
                  onClick={() => handleUpdateStatus('draft')}
                  className="px-6 py-2 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-all"
                >
                  Re-open as Draft
                </button>
              )}
            </div>
          </div>

          {isEditingSchedule && (
            <div className="bg-school-cream-50 p-6 rounded-2xl border border-school-cream-100 mb-8 animate-in slide-in-from-top-2 duration-300">
              <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Update Election Schedule</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Start Time</label>
                  <input 
                    type="datetime-local"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-school-green-500"
                    value={editSchedule.start_time}
                    onChange={(e) => setEditSchedule({ ...editSchedule, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">End Time</label>
                  <input 
                    type="datetime-local"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-school-green-500"
                    value={editSchedule.end_time}
                    onChange={(e) => setEditSchedule({ ...editSchedule, end_time: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button 
                    onClick={handleUpdateSchedule}
                    className="px-8 py-2.5 bg-school-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-school-green-700 shadow-lg shadow-school-green-100"
                  >
                    Save New Schedule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Turnout</p>
                <p className="text-3xl font-black text-gray-900">{stats.percentage}%</p>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                  <div className="bg-school-green-500 h-1.5 rounded-full" style={{ width: `${stats.percentage}%` }}></div>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Votes</p>
                <p className="text-3xl font-black text-gray-900">{stats.voted}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Positions</p>
                <p className="text-3xl font-black text-gray-900">{positions.length}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-100 mb-8 overflow-x-auto">
            {(['positions', 'candidates', 'results'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? 'text-school-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-school-green-600 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'positions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-bold text-gray-900">Election Positions</h4>
                  <p className="text-sm text-gray-500">{positions.length} defined roles</p>
                </div>
                
                <form onSubmit={handleAddPosition} className="bg-school-cream-50/50 p-6 rounded-2xl border border-school-cream-100 flex flex-wrap gap-4 items-end">
                  <div className="flex-grow min-w-[200px] space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase">Position Title</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. School Prefect"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green-500 outline-none"
                      value={newPosition.title}
                      onChange={(e) => setNewPosition({...newPosition, title: e.target.value})}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase">Max Picks</label>
                    <input 
                      required
                      type="number"
                      min="1"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green-500 outline-none"
                      value={newPosition.max_selections}
                      onChange={(e) => setNewPosition({...newPosition, max_selections: parseInt(e.target.value)})}
                    />
                  </div>
                  <button type="submit" className="bg-school-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-school-green-700 shadow-md">
                    Add Role
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {positions.map((pos) => (
                    <div key={pos.id} className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-school-green-200 transition-colors flex justify-between items-center">
                      <div>
                        <p className="font-black text-gray-900 uppercase tracking-tight">{pos.title}</p>
                        <p className="text-xs text-gray-500 font-bold">Max choices: {pos.max_selections}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'candidates' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-bold text-gray-900">Manage Candidates</h4>
                  <p className="text-sm text-gray-500">Assigning students to positions</p>
                </div>

                <form onSubmit={handleAddCandidate} className="bg-blue-50/30 p-8 rounded-[2.5rem] border border-blue-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase">Select Position</label>
                    <select 
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none bg-white"
                      value={newCandidate.position_id}
                      onChange={(e) => setNewCandidate({...newCandidate, position_id: parseInt(e.target.value)})}
                    >
                      <option value="">Choose Position...</option>
                      {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase">Link Student (Search)</label>
                    <select 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none bg-white font-medium"
                      value={newCandidate.student_id}
                      onChange={(e) => handleStudentSelect(e.target.value)}
                    >
                      <option value="">Manual Entry / Search...</option>
                      {allStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.surname} {s.other_names} ({s.class_name})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase">Display Name</label>
                    <input 
                      required
                      type="text"
                      placeholder="Candidate's Name"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
                      value={newCandidate.display_name}
                      onChange={(e) => setNewCandidate({...newCandidate, display_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase">Image URL (or upload)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="https://..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
                        value={newCandidate.image_url}
                        onChange={(e) => setNewCandidate({...newCandidate, image_url: e.target.value})}
                      />
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest border border-gray-200 shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Device
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase">Manifesto / Vision Statement</label>
                    <textarea 
                      placeholder="The candidate's vision..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 min-h-[100px] outline-none"
                      value={newCandidate.manifesto}
                      onChange={(e) => setNewCandidate({...newCandidate, manifesto: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-black hover:bg-blue-700 shadow-lg shadow-blue-200 uppercase tracking-widest text-xs">
                    Register Candidate
                  </button>
                </form>

                {positions.map((pos) => (
                  <div key={pos.id} className="space-y-4">
                    <h5 className="font-black text-gray-900 uppercase tracking-widest text-sm bg-gray-50 px-4 py-2 rounded-lg border-l-4 border-school-green-600">{pos.title}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {candidates[pos.id]?.map((cand) => (
                        <div key={cand.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center space-x-4 hover:shadow-sm transition-shadow">
                          <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden ring-1 ring-gray-100">
                            {cand.image_url ? (
                              <img src={cand.image_url} alt={cand.display_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                <svg className="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <p className="font-black text-gray-900 leading-tight">{cand.display_name}</p>
                            <p className="text-[10px] font-black text-school-green-600 uppercase tracking-widest mt-1">
                              {cand.student_class || 'Class Unknown'}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1 italic mt-1">{cand.manifesto || 'No manifesto recorded.'}</p>
                          </div>
                          <button className="text-gray-300 hover:text-red-600 p-2 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {(!candidates[pos.id] || candidates[pos.id].length === 0) && (
                        <p className="text-xs text-gray-400 font-medium col-span-full py-4 text-center border-2 border-dashed border-gray-100 rounded-2xl">No candidates registered for this role yet.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-8">
                 <div className="flex justify-between items-center">
                  <h4 className="text-xl font-bold text-gray-900">Live Election Results</h4>
                  <button onClick={() => fetchElectionDetails(selectedElection.id)} className="text-school-green-600 text-sm font-bold flex items-center hover:underline">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Results
                  </button>
                </div>

                {positions.map((pos) => {
                  const posResults = results.filter(r => r.position_title === pos.title);
                  const totalPosVotes = posResults.reduce((sum, r) => sum + parseInt(r.vote_count), 0);

                  return (
                    <div key={pos.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                      <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                        <h5 className="font-black text-gray-900 uppercase tracking-[0.2em] text-sm">{pos.title}</h5>
                        <span className="text-xs font-black text-gray-400 uppercase">{totalPosVotes} Total Votes Cast</span>
                      </div>
                      <div className="p-8 space-y-6">
                        {posResults.map((r, idx) => {
                          const percentage = totalPosVotes > 0 ? (parseInt(r.vote_count) / totalPosVotes) * 100 : 0;
                          return (
                            <div key={idx} className="space-y-3">
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="font-bold text-gray-900 flex items-center">
                                    {r.candidate_name}
                                    {idx === 0 && totalPosVotes > 0 && (
                                      <span className="ml-3 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-black uppercase rounded-full border border-yellow-200">Leading</span>
                                    )}
                                  </p>
                                  <p className="text-[10px] font-black text-school-green-600 uppercase tracking-widest mt-0.5">{r.candidate_class}</p>
                                </div>
                                <p className="text-sm font-black text-gray-600">{r.vote_count} votes ({percentage.toFixed(1)}%)</p>
                              </div>
                              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${
                                    idx === 0 ? 'bg-school-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-blue-400'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                        {posResults.length === 0 && (
                          <div className="py-12 text-center">
                             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                             </div>
                             <p className="text-gray-400 font-bold">No results available yet for this position.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Election Management</h3>
          <p className="text-sm text-gray-600">Create and manage school-wide prefect elections</p>
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
                placeholder="e.g. SRC Prefect Elections 2026"
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
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteElection(election.id, election.name);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Election"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                  <span>{new Date(election.start_time).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>Identity Architecture v4.2</span>
              <button 
                onClick={() => setSelectedElection(election)}
                className="text-school-green-600 text-xs font-black underline hover:text-school-green-800"
              >
                Manage Details &rarr;
              </button>
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
            <h5 className="font-bold text-gray-400 uppercase tracking-widest">No Elections Found</h5>
            <p className="text-sm text-gray-400 mt-1">Start by creating an SRC election.</p>
          </div>
        )}
      </div>
    </div>
  );
};
