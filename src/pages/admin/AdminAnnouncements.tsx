import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../AuthContext';
import {
  MegaphoneIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CalendarDaysIcon,
  BuildingLibraryIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { PortalButton } from '../../components/PortalButton';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_by: number;
  created_by_user_id: string;
  class_id: number | null;
  class_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Class {
  id: number;
  class_name: string;
  form: number;
  stream: string;
}

export function AdminAnnouncements() {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    class_id: 'school'
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchClasses();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await db.getAnnouncements();
      setAnnouncements((data as Announcement[]) || []);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      toast.error('Failed to load institutional announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await db.getClasses();
      setClasses((data as Class[]) || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const announcementData = {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        created_by: user?.id || 0,
        class_id: newAnnouncement.class_id === 'school' ? undefined : parseInt(newAnnouncement.class_id)
      };
      
      await db.createAnnouncement(announcementData);
      setNewAnnouncement({ title: '', content: '', class_id: 'school' });
      setShowCreateModal(false);
      fetchAnnouncements();
      toast.success('Official bulletin published successfully');
    } catch (error) {
      console.error('Failed to create announcement:', error);
      toast.error('Failed to publish announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this official announcement?')) {
      try {
        await db.deleteAnnouncement(id);
        fetchAnnouncements();
        toast.success('Announcement removed');
      } catch (error) {
        console.error('Failed to delete announcement:', error);
        toast.error('Failed to delete announcement');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Institutional Announcements & Circulars</h2>
          <p className="text-xs text-gray-500 mt-0.5">Broadcast school-wide or class-targeted official communications</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors shadow-2xs flex items-center gap-1.5"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Publish Announcement</span>
        </button>
      </div>

      {loading ? (
        <div className="p-4">
          <LoadingSkeleton variant="card" rows={3} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-md border border-gray-200 p-5 shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{announcement.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span className="tabular-nums font-mono">{formatDate(announcement.created_at)}</span>
                      <span>•</span>
                      <span className="font-mono text-gray-600">{announcement.created_by_user_id}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded-xs transition-colors"
                    title="Delete Announcement"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-700 mt-3 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
              </div>
              
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                {announcement.class_name ? (
                  <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    Cohort: {announcement.class_name}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-green-50 text-green-800 border border-green-200">
                    School-Wide Broadcast
                  </span>
                )}
                <span className="text-[11px] text-gray-400 tabular-nums font-mono">
                  {new Date(announcement.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {announcements.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white rounded-md border border-dashed border-gray-200">
              <p className="text-xs text-gray-400">No announcements published. Click "Publish Announcement" to create one.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Publish Official Announcement</h2>
                <p className="text-xs text-gray-500 mt-0.5">Disseminate institutional bulletins and notices</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAnnouncement} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Announcement Subject / Headline *</label>
                <input
                  type="text"
                  required
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white"
                  placeholder="e.g. End of Semester Examination Timetable Notice"
                />
              </div>
              
              <div>
                <label className="block font-medium text-gray-700 mb-1">Target Audience Cohort *</label>
                <select
                  value={newAnnouncement.class_id}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, class_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white"
                >
                  <option value="school">School-wide (All Students & Faculty)</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name} (Form {cls.form}{cls.stream})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block font-medium text-gray-700 mb-1">Announcement Body Content *</label>
                <textarea
                  required
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white"
                  placeholder="Enter the full text of the official notice..."
                />
              </div>
              
              <div className="bg-blue-50/60 p-3 rounded-sm border border-blue-200 text-blue-900 leading-relaxed">
                <div className="flex items-start gap-2">
                  <InformationCircleIcon className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-800">
                    {newAnnouncement.class_id === 'school' 
                      ? 'This circular will immediately be displayed on the student and teacher dashboard feeds across all classes.' 
                      : `This circular will only be routed to members of ${classes.find(c => c.id === parseInt(newAnnouncement.class_id))?.class_name || 'the selected class'}.`}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <PortalButton
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors shadow-2xs"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
                </PortalButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnnouncements;