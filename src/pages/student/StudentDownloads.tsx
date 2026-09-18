import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { localDb, OfflineAssessment, OfflineAttempt } from '../../services/localDb';
import { syncEngine } from '../../services/syncEngine';
import { QuizRunner } from './QuizRunner';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';

interface DownloadItem {
  id: number;
  title: string;
  description: string;
  type: 'report' | 'circular' | 'note';
  fileSize: string;
  uploadDate: string;
  uploader: string;
}

export const StudentDownloads: React.FC<{ studentId?: number }> = ({ studentId = 1 }) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'materials'>('vault');
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Vault State
  const [offlineAssessments, setOfflineAssessments] = useState<OfflineAssessment[]>([]);
  const [pendingAttempts, setPendingAttempts] = useState<OfflineAttempt[]>([]);
  const [selectedOfflineQuiz, setSelectedOfflineQuiz] = useState<OfflineAssessment | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchMaterials();
    fetchVaultData();
  }, [studentId]);

  const fetchVaultData = async () => {
    try {
      const assessments = await localDb.getOfflineAssessments(studentId);
      const attempts = await localDb.getPendingSyncAttempts();
      setOfflineAssessments(assessments);
      setPendingAttempts(attempts);
    } catch (e) {
      console.error('Failed to load offline vault:', e);
    }
  };

  const fetchMaterials = () => {
    setTimeout(() => {
      setDownloads([
        {
          id: 1,
          title: 'Semester 1 Report Sheet',
          description: 'Your complete academic report for the first semester',
          type: 'report',
          fileSize: '2.4 MB',
          uploadDate: '2025-04-01',
          uploader: 'Admin Office'
        },
        {
          id: 2,
          title: 'School Calendar 2025/2026',
          description: 'Academic calendar for the current academic year',
          type: 'circular',
          fileSize: '1.1 MB',
          uploadDate: '2025-03-15',
          uploader: 'Admin Office'
        },
        {
          id: 3,
          title: 'Physics Lab Manual',
          description: 'Laboratory procedures and safety guidelines',
          type: 'note',
          fileSize: '3.7 MB',
          uploadDate: '2025-03-10',
          uploader: 'Mr. Johnson'
        },
        {
          id: 4,
          title: 'Semester 2 Report Sheet',
          description: 'Your complete academic report for the second semester',
          type: 'report',
          fileSize: '2.6 MB',
          uploadDate: '2025-07-15',
          uploader: 'Admin Office'
        },
        {
          id: 5,
          title: 'Examination Guidelines',
          description: 'Rules and regulations for upcoming examinations',
          type: 'circular',
          fileSize: '0.8 MB',
          uploadDate: '2025-06-20',
          uploader: 'Admin Office'
        }
      ]);
      setLoading(false);
    }, 400);
  };

  const handleSyncPending = async () => {
    if (!navigator.onLine) {
      toast.error('You are currently offline. Please connect to the internet to sync results.');
      return;
    }
    setIsSyncing(true);
    try {
      await syncEngine.syncPendingAttempts();
      await fetchVaultData();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemoveAssessment = async (id: number) => {
    await localDb.deleteOfflineAssessment(studentId, id);
    toast.success('Removed assessment from offline vault.');
    fetchVaultData();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'report': return 'bg-green-100 text-green-800';
      case 'circular': return 'bg-blue-100 text-blue-800';
      case 'note': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDownloads = filter === 'all' 
    ? downloads 
    : downloads.filter(item => item.type === filter);

  if (selectedOfflineQuiz) {
    return (
      <QuizRunner
        studentId={studentId}
        quizId={selectedOfflineQuiz.id}
        offlineAssessment={selectedOfflineQuiz}
        standalone={true}
        onClose={() => {
          setSelectedOfflineQuiz(null);
          fetchVaultData();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="bg-white rounded-md p-5 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">Offline Storage & Course Downloads</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage cached assessments for offline completion and download syllabus resources</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-sm border border-gray-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('vault')}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-sm font-semibold text-xs transition-colors flex items-center gap-2 ${
              activeTab === 'vault'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Offline APK Vault</span>
            {pendingAttempts.length > 0 && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] px-1.5 py-0.2 rounded-sm font-bold tabular-nums">
                {pendingAttempts.length} Sync
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-sm font-semibold text-xs transition-colors flex items-center gap-2 ${
              activeTab === 'materials'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Course Materials</span>
          </button>
        </div>
      </div>

      {/* VAULT TAB CONTENT */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {/* Pending Sync Banner */}
          {pendingAttempts.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-md p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-sm bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 text-sm font-bold shrink-0 mt-0.5">
                  !
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 text-xs uppercase tracking-wider">Pending Offline Submissions ({pendingAttempts.length})</h4>
                  <p className="text-amber-800 text-xs mt-0.5">You completed assessments in offline mode. Connect to Wi-Fi/Internet and sync to upload your grades to the server.</p>
                </div>
              </div>
              <PortalButton
                onClick={handleSyncPending}
                loading={isSyncing}
                loadingText="Syncing Results..."
                variant="primary"
                size="sm"
                className="whitespace-nowrap"
              >
                Sync to Server
              </PortalButton>
            </div>
          )}

          {/* Checked-Out Assessments List */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
              Cached Assessments in APK Storage (<span className="tabular-nums">{offlineAssessments.length}</span>)
            </h3>
            {offlineAssessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offlineAssessments.map((assessment) => {
                  const pendingAttempt = pendingAttempts.find(a => a.assessment_id === assessment.id);
                  return (
                    <div key={assessment.id} className="bg-white rounded-md border border-gray-200 p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-fast ease-standard">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-[11px] font-semibold rounded-sm border border-gray-200 uppercase tracking-wider">
                            {assessment.subject_name}
                          </span>
                          <span className="text-[11px] text-gray-500 tabular-nums">
                            Cached: {new Date(assessment.checked_out_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">{assessment.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{assessment.instructions || 'Standard assessment instructions apply.'}</p>
                        <div className="flex gap-4 text-xs text-gray-600 pt-1 tabular-nums">
                          <span>{assessment.duration_minutes} Mins</span>
                          <span>{assessment.questions?.length || 0} Questions</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 mt-4">
                        <button
                          onClick={() => handleRemoveAssessment(assessment.id)}
                          className="min-h-[36px] text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-sm transition-colors"
                        >
                          Remove from Cache
                        </button>

                        {pendingAttempt ? (
                          <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-sm tabular-nums">
                            Completed • Pending Sync
                          </span>
                        ) : (
                          <PortalButton
                            onClick={() => setSelectedOfflineQuiz(assessment)}
                            size="sm"
                            variant="primary"
                          >
                            Launch Offline
                          </PortalButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-md p-8 text-center border border-gray-200 space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">No Offline Assessments Stored</h4>
                <p className="text-gray-500 text-xs max-w-md mx-auto">
                  When online, visit <strong>Digital Assessments</strong> or <strong>School Exams</strong> and select <strong>"Save for Offline"</strong> to download full question sets for taking without internet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COURSE MATERIALS TAB CONTENT */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="bg-white rounded-md p-4 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Materials & Reference Documents</h3>
            <div className="flex space-x-1.5">
              {['all', 'report', 'circular', 'note'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`min-h-[32px] px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
                    filter === f 
                      ? 'bg-school-green-700 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-school-green-200 border-t-school-green-700"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDownloads.map((item) => (
                <div key={item.id} className="bg-white rounded-md p-4 border border-gray-200 hover:-translate-y-0.5 transition-all duration-fast ease-standard flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold border ${
                        item.type === 'report' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        item.type === 'circular' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {item.type.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-gray-500 tabular-nums">{item.uploadDate}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1 leading-snug">{item.title}</h4>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="tabular-nums">{item.fileSize} • {item.uploader}</span>
                    <button
                      onClick={() => toast.success(`Downloading ${item.title}...`)}
                      aria-label={`Download ${item.title}`}
                      className="min-h-[36px] text-school-green-800 font-semibold hover:underline flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-school-green-700"
                    >
                      <span>Download</span>
                      <span aria-hidden="true">&darr;</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};