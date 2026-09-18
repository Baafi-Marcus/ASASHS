import React, { useState, useEffect } from 'react';
import db from '../../../lib/neon';
import { toast } from 'react-hot-toast';
import {
  CalendarDaysIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  UserPlusIcon,
  PhotoIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { PortalButton } from '../../components/PortalButton';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { UserAvatar } from '../../components/UserAvatar';

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
      toast.success(`Election ${status === 'open' ? 'commenced' : status === 'paused' ? 'paused' : status === 'closed' ? 'concluded' : 'moved to draft'}`);
      const updated = { ...selectedElection, status };
      setSelectedElection(updated);
      fetchElections();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const fetchElections = async () => {
    try {
      setLoading(true);
      const data = await db.getElections();
      setElections(data || []);
    } catch (error) {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const data = await db.getStudents({ limit: 1000 }); 
      setAllStudents(data || []);
    } catch (error) {
      console.error('Failed to load students for candidate selection');
    }
  };

  const fetchElectionDetails = async (id: number) => {
    try {
      const posData = await db.getPositions(id);
      setPositions(posData || []);
      
      const candData: Record<number, Candidate[]> = {};
      for (const pos of (posData || [])) {
        candData[pos.id] = await db.getCandidates(pos.id);
      }
      setCandidates(candData);

      const statsData = await db.getParticipationStats(id);
      setStats(statsData);

      const resultsData = await db.getElectionResults(id);
      setResults(resultsData || []);
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
      setNewElection({ name: '', description: '', start_time: '', end_time: '' });
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-green-50 text-green-800 border border-green-200">Active / Polls Open</span>;
      case 'paused':
        return <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">Paused</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">Concluded</span>;
      default:
        return <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">Draft Setup</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="stats" />
        <LoadingSkeleton variant="card" rows={3} />
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (selectedElection) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedElection(null)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Return to Elections Directory</span>
        </button>

        <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
          {/* Executive Header */}
          <div className="p-5 sm:p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-gray-900">{selectedElection.name}</h3>
                {getStatusBadge(selectedElection.status)}
              </div>
              <p className="text-xs text-gray-500 mt-1">{selectedElection.description || 'Institutional leadership and prefect electoral process.'}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setIsEditingSchedule(!isEditingSchedule)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <ClockIcon className="w-4 h-4 text-gray-500" />
                <span>{isEditingSchedule ? 'Cancel Schedule Edit' : 'Edit Polling Hours'}</span>
              </button>

              {selectedElection.status === 'draft' && (
                <button 
                  onClick={() => handleUpdateStatus('open')}
                  className="px-3.5 py-1.5 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>Commence Polling</span>
                </button>
              )}
              {selectedElection.status === 'open' && (
                <>
                  <button 
                    onClick={() => handleUpdateStatus('paused')}
                    className="px-3 py-1.5 bg-blue-700 text-white rounded-sm text-xs font-medium hover:bg-blue-800 transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <PauseIcon className="w-4 h-4" />
                    <span>Pause Voting</span>
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('closed')}
                    className="px-3 py-1.5 bg-red-700 text-white rounded-sm text-xs font-medium hover:bg-red-800 transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <StopIcon className="w-4 h-4" />
                    <span>Conclude Election</span>
                  </button>
                </>
              )}
              {selectedElection.status === 'paused' && (
                <button 
                  onClick={() => handleUpdateStatus('open')}
                  className="px-3.5 py-1.5 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>Resume Polling</span>
                </button>
              )}
              {selectedElection.status === 'closed' && (
                <button 
                  onClick={() => handleUpdateStatus('draft')}
                  className="px-3 py-1.5 bg-gray-700 text-white rounded-sm text-xs font-medium hover:bg-gray-800 transition-colors shadow-2xs"
                >
                  Reset to Draft
                </button>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {isEditingSchedule && (
              <div className="bg-gray-50/70 p-4 rounded-sm border border-gray-200">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-3">Adjust Polling Schedule</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end text-xs">
                  <div>
                    <label className="block text-gray-600 mb-1 font-medium">Polling Opens</label>
                    <input 
                      type="datetime-local"
                      className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white tabular-nums text-xs"
                      value={editSchedule.start_time}
                      onChange={(e) => setEditSchedule({ ...editSchedule, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1 font-medium">Polling Closes</label>
                    <input 
                      type="datetime-local"
                      className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white tabular-nums text-xs"
                      value={editSchedule.end_time}
                      onChange={(e) => setEditSchedule({ ...editSchedule, end_time: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button 
                      onClick={handleUpdateSchedule}
                      className="px-4 py-2 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors"
                    >
                      Commit Schedule
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Metrics */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Student Turnout</span>
                  <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{stats.percentage}%</p>
                  <div className="w-full bg-gray-100 h-1.5 rounded-sm mt-2 overflow-hidden">
                    <div className="bg-school-green-700 h-1.5 rounded-sm" style={{ width: `${stats.percentage}%` }} />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Ballots Cast</span>
                  <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{stats.voted}</p>
                  <span className="text-[11px] text-gray-400 mt-1 block tabular-nums">Out of {stats.total} registered voters</span>
                </div>
                <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Contested Offices</span>
                  <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{positions.length}</p>
                  <span className="text-[11px] text-gray-400 mt-1 block">Configured positions</span>
                </div>
              </div>
            )}

            {/* Sub-tab Navigation */}
            <div className="border-b border-gray-200 flex space-x-1">
              {(['positions', 'candidates', 'results'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-school-green-700 text-school-green-800 bg-school-green-50/40'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'positions' ? 'Offices & Roles' : tab === 'candidates' ? 'Candidate Slate' : 'Live Vote Tally'}
                </button>
              ))}
            </div>

            {/* Sub-tab Content */}
            <div>
              {activeTab === 'positions' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Electoral Offices & Portfolios</h4>
                      <p className="text-xs text-gray-500">Define student executive positions for this election</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleAddPosition} className="bg-gray-50/70 p-4 rounded-sm border border-gray-200 flex flex-wrap gap-3 items-end text-xs">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block font-medium text-gray-700 mb-1">Portfolio Title</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Senior Boys Prefect"
                        className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white"
                        value={newPosition.title}
                        onChange={(e) => setNewPosition({...newPosition, title: e.target.value})}
                      />
                    </div>
                    <div className="w-28">
                      <label className="block font-medium text-gray-700 mb-1">Max Picks</label>
                      <input 
                        required
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white tabular-nums"
                        value={newPosition.max_selections}
                        onChange={(e) => setNewPosition({...newPosition, max_selections: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-school-green-700 text-white rounded-sm font-medium hover:bg-school-green-800 transition-colors">
                      + Add Office
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {positions.map((pos) => (
                      <div key={pos.id} className="p-3.5 rounded-sm border border-gray-200 bg-white hover:border-gray-300 transition-colors flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-gray-900">{pos.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 tabular-nums">Allowed selections: {pos.max_selections}</p>
                        </div>
                        <span className="text-[11px] text-school-green-700 font-medium tabular-nums font-mono">
                          {candidates[pos.id]?.length || 0} candidate(s)
                        </span>
                      </div>
                    ))}
                    {positions.length === 0 && (
                      <p className="text-xs text-gray-400 col-span-3 py-8 text-center border border-dashed border-gray-200 rounded-sm">
                        No offices created. Add portfolios above to populate the ballot.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'candidates' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Register Candidate Nominees</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Assign enrolled students to specific contested portfolios</p>
                  </div>

                  <form onSubmit={handleAddCandidate} className="bg-gray-50/70 p-4 sm:p-5 rounded-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end text-xs">
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Contested Office *</label>
                      <select 
                        required
                        className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white"
                        value={newCandidate.position_id}
                        onChange={(e) => setNewCandidate({...newCandidate, position_id: parseInt(e.target.value)})}
                      >
                        <option value="">Select Office...</option>
                        {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Student Register Lookup</label>
                      <select 
                        className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white"
                        value={newCandidate.student_id}
                        onChange={(e) => handleStudentSelect(e.target.value)}
                      >
                        <option value="">Search Student...</option>
                        {allStudents.map(s => (
                          <option key={s.id} value={s.id}>{s.surname} {s.other_names} ({s.class_name})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Ballot Display Name *</label>
                      <input 
                        required
                        type="text"
                        placeholder="Full Nominee Name"
                        className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white"
                        value={newCandidate.display_name}
                        onChange={(e) => setNewCandidate({...newCandidate, display_name: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Candidate Portrait</label>
                      <div className="flex gap-1.5">
                        <input 
                          type="text"
                          placeholder="Image URL..."
                          className="flex-1 px-3 py-2 rounded-sm border border-gray-300 bg-white text-xs"
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
                          className="px-2.5 py-2 border border-gray-300 bg-white hover:bg-gray-100 rounded-sm text-xs font-medium text-gray-700 flex items-center gap-1"
                        >
                          <PhotoIcon className="w-3.5 h-3.5" />
                          <span>File</span>
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block font-medium text-gray-700 mb-1">Manifesto Summary</label>
                      <textarea 
                        placeholder="Brief vision statement or manifesto commitments..."
                        className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white text-xs"
                        rows={2}
                        value={newCandidate.manifesto}
                        onChange={(e) => setNewCandidate({...newCandidate, manifesto: e.target.value})}
                      />
                    </div>

                    <div className="flex justify-end">
                      <PortalButton
                        type="submit" 
                        className="w-full py-2 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors shadow-2xs"
                      >
                        Register Nominee
                      </PortalButton>
                    </div>
                  </form>

                  {positions.map((pos) => (
                    <div key={pos.id} className="space-y-3">
                      <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                        <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{pos.title}</h5>
                        <span className="text-[11px] text-gray-400 tabular-nums font-mono">
                          {candidates[pos.id]?.length || 0} candidate(s)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {candidates[pos.id]?.map((cand) => (
                          <div key={cand.id} className="bg-white border border-gray-200 rounded-sm p-3.5 flex items-center space-x-3 text-xs">
                            <div className="w-12 h-12 rounded-sm bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                              {cand.image_url ? (
                                <img src={cand.image_url} alt={cand.display_name} className="w-full h-full object-cover" />
                              ) : (
                                <UserAvatar name={cand.display_name} size="md" className="rounded-sm" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{cand.display_name}</p>
                              <p className="text-[11px] text-school-green-700 font-medium">{cand.student_class || 'General'}</p>
                              <p className="text-[11px] text-gray-500 truncate mt-0.5">{cand.manifesto || 'No manifesto provided.'}</p>
                            </div>
                          </div>
                        ))}
                        {(!candidates[pos.id] || candidates[pos.id].length === 0) && (
                          <p className="text-xs text-gray-400 col-span-full py-4 text-center border border-dashed border-gray-200 rounded-sm">
                            No nominees registered for {pos.title}.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'results' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Live Ballot Tally & Official Returns</h4>
                      <p className="text-xs text-gray-500">Real-time certified vote counts from student voting stations</p>
                    </div>
                    <button
                      onClick={() => fetchElectionDetails(selectedElection.id)}
                      className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <ArrowPathIcon className="w-3.5 h-3.5 text-gray-500" />
                      <span>Refresh Tally</span>
                    </button>
                  </div>

                  {positions.map((pos) => {
                    const posResults = results.filter(r => r.position_title === pos.title);
                    const totalPosVotes = posResults.reduce((sum, r) => sum + parseInt(r.vote_count || 0), 0);

                    return (
                      <div key={pos.id} className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center text-xs">
                          <h5 className="font-bold text-gray-900 uppercase tracking-wider">{pos.title}</h5>
                          <span className="text-gray-500 font-medium tabular-nums">{totalPosVotes} votes cast</span>
                        </div>
                        <div className="p-4 sm:p-5 space-y-4">
                          {posResults.map((r, idx) => {
                            const percentage = totalPosVotes > 0 ? (parseInt(r.vote_count) / totalPosVotes) * 100 : 0;
                            const isLeading = idx === 0 && totalPosVotes > 0;
                            return (
                              <div key={idx} className="space-y-1.5 text-xs">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{r.candidate_name}</span>
                                    {isLeading && (
                                      <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xs text-[10px] font-bold">
                                        Leading
                                      </span>
                                    )}
                                    <span className="text-gray-400 text-[11px]">{r.candidate_class}</span>
                                  </div>
                                  <span className="font-mono font-medium text-gray-700 tabular-nums">
                                    {r.vote_count} votes ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-sm overflow-hidden">
                                  <div 
                                    className={`h-full rounded-sm transition-all duration-500 ${
                                      isLeading ? 'bg-school-green-700' : 'bg-slate-400'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                          {posResults.length === 0 && (
                            <div className="py-8 text-center text-xs text-gray-400">
                              No ballots recorded yet for this office.
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
      </div>
    );
  }

  // --- DIRECTORY OVERVIEW ---
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Prefect & SRC Election Governance</h3>
          <p className="text-xs text-gray-500 mt-0.5">Administer institutional elections, verify nomination slates, and monitor live returns</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors shadow-2xs flex items-center gap-1.5"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Election Cycle</span>
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-5 sm:p-6 rounded-md shadow-xs border border-gray-200 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-900">Configure New Election Cycle</h4>
            <button onClick={() => setIsCreating(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded-sm">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreateElection} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Election Title *</label>
              <input
                required
                type="text"
                placeholder="e.g. 2026/2027 Prefect Council Elections"
                className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white"
                value={newElection.name}
                onChange={(e) => setNewElection({...newElection, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="Scope and purpose of this election"
                className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white"
                value={newElection.description}
                onChange={(e) => setNewElection({...newElection, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Polling Starts *</label>
              <input
                required
                type="datetime-local"
                className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white tabular-nums"
                value={newElection.start_time}
                onChange={(e) => setNewElection({...newElection, start_time: e.target.value})}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Polling Closes *</label>
              <input
                required
                type="datetime-local"
                className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white tabular-nums"
                value={newElection.end_time}
                onChange={(e) => setNewElection({...newElection, end_time: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors shadow-2xs"
              >
                Create Election
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Elections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {elections.map((election) => (
          <div key={election.id} className="bg-white rounded-md border border-gray-200 shadow-xs p-5 hover:border-gray-300 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start mb-3">
                {getStatusBadge(election.status)}
                <button 
                  onClick={() => handleDeleteElection(election.id, election.name)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded-xs transition-colors"
                  title="Delete Election"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-sm font-bold text-gray-900">{election.name}</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{election.description || 'No description provided.'}</p>
              
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 tabular-nums">
                  <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span>Scheduled: {new Date(election.start_time).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedElection(election)}
                className="text-xs font-semibold text-school-green-700 hover:text-school-green-800 hover:underline"
              >
                Manage Slates & Results &rarr;
              </button>
            </div>
          </div>
        ))}

        {elections.length === 0 && !isCreating && (
          <div className="md:col-span-2 lg:col-span-3 py-12 text-center bg-white rounded-md border border-dashed border-gray-200">
            <p className="text-xs text-gray-400">No active or past elections configured. Click "New Election Cycle" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
};
