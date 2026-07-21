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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Offline APK Vault & Downloads</h2>
          <p className="text-gray-500 text-sm">Access checked-out assessments offline or download class resources</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${
              activeTab === 'vault'
                ? 'bg-school-green-600 text-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>📱 APK Offline Vault</span>
            {pendingAttempts.length > 0 && (
              <span className="bg-amber-400 text-gray-900 text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                {pendingAttempts.length} Sync
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${
              activeTab === 'materials'
                ? 'bg-school-green-600 text-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>📚 Course Materials</span>
          </button>
        </div>
      </div>

      {/* VAULT TAB CONTENT */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {/* Pending Sync Banner */}
          {pendingAttempts.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-2xl shrink-0">
                  ⚠️
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-lg">Pending Offline Results ({pendingAttempts.length})</h4>
                  <p className="text-amber-700 text-sm">You completed {pendingAttempts.length} assessment(s) offline. Sync now to transmit your scores to the server gradebook.</p>
                </div>
              </div>
              <PortalButton
                onClick={handleSyncPending}
                disabled={isSyncing}
                className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap px-6 py-3 shadow-lg"
              >
                {isSyncing ? 'Syncing...' : '🔄 Sync Results to Server'}
              </PortalButton>
            </div>
          )}

          {/* Checked-Out Assessments List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 px-1">Checked-Out Assessments in Local APK Storage</h3>
            {offlineAssessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offlineAssessments.map((assessment) => {
                  const pendingAttempt = pendingAttempts.find(a => a.assessment_id === assessment.id);
                  return (
                    <PortalCard key={assessment.id} className="border-l-4 border-l-school-green-600 shadow-lg bg-white flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 bg-school-green-100 text-school-green-800 text-xs font-bold rounded-full uppercase tracking-wider">
                            {assessment.subject_name}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            Checked out: {new Date(assessment.checked_out_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">{assessment.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{assessment.instructions || 'No special instructions.'}</p>
                        <div className="flex gap-4 text-xs font-bold text-gray-600 pt-2">
                          <span>⏱️ {assessment.duration_minutes} Mins</span>
                          <span>❓ {assessment.questions.length} Questions</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-3 mt-4">
                        <button
                          onClick={() => handleRemoveAssessment(assessment.id)}
                          className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition"
                        >
                          🗑️ Remove
                        </button>

                        {pendingAttempt ? (
                          <div className="text-right">
                            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1.5 rounded-xl">
                              ⏳ Completed (Pending Sync)
                            </span>
                          </div>
                        ) : (
                          <PortalButton
                            onClick={() => setSelectedOfflineQuiz(assessment)}
                            className="bg-school-green-700 hover:bg-school-green-800 px-6"
                          >
                            🚀 Launch Offline
                          </PortalButton>
                        )}
                      </div>
                    </PortalCard>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-3xl">
                  📱
                </div>
                <h4 className="text-lg font-bold text-gray-900">Your Offline APK Vault is Empty</h4>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  When connected to the internet, go to **Digital Assessments** or **School Exams** and click **"📥 Check-Out to APK Vault"** to download complete assessments along with all diagrams for offline testing!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COURSE MATERIALS TAB CONTENT */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Course Materials & Circulars</h3>
            <div className="flex space-x-2">
              {['all', 'report', 'circular', 'note'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition ${
                    filter === f ? 'bg-school-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f + 's'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-school-green-200 border-t-school-green-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDownloads.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getTypeColor(item.type)}`}>
                      {item.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{item.uploadDate}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50">
                    <span>{item.fileSize} &bull; {item.uploader}</span>
                    <button
                      onClick={() => toast.success(`Downloading ${item.title}...`)}
                      className="text-school-green-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Download</span>
                      <span>↓</span>
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