import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../AuthContext';

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
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    class_id: 'school' // 'school' for school-wide, or class ID for class-specific
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchClasses();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await db.getAnnouncements();
      setAnnouncements(data as Announcement[]);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await db.getClasses();
      setClasses(data as Class[]);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
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
      toast.success('Announcement created successfully');
    } catch (error) {
      console.error('Failed to create announcement:', error);
      toast.error('Failed to create announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await db.deleteAnnouncement(id);
        fetchAnnouncements();
        toast.success('Announcement deleted successfully');
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Announcements Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 transition-colors font-medium"
        >
          Create Announcement
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{announcement.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{formatDate(announcement.created_at)}</span>
                    <span className="text-xs bg-school-green-100 text-school-green-800 px-2 py-1 rounded">
                      {announcement.created_by_user_id}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-700 mt-3">{announcement.content}</p>
              
              <div className="mt-4 flex items-center justify-between">
                {announcement.class_name ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <svg className="mr-1.5 h-2 w-2 text-blue-800" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx={4} cy={4} r={3} />
                    </svg>
                    {announcement.class_name}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="mr-1.5 h-2 w-2 text-green-800" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx={4} cy={4} r={3} />
                    </svg>
                    School-wide
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(announcement.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {announcements.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No announcements yet</h3>
              <p className="text-gray-500">Create your first announcement to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-school-green-700 px-4 py-3 rounded-t-2xl">
              <h2 className="text-lg font-bold text-white">Create New Announcement</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  placeholder="Announcement title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={newAnnouncement.class_id}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, class_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                >
                  <option value="school">School-wide Announcement</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name} (Form {cls.form}{cls.stream})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  placeholder="Announcement content"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex">
                  <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Announcement Visibility</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      {newAnnouncement.class_id === 'school' 
                        ? 'This announcement will be visible to the entire school.' 
                        : `This announcement will only be visible to students in ${classes.find(c => c.id === parseInt(newAnnouncement.class_id))?.class_name || 'the selected class'}.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                className="px-3 py-1.5 text-sm bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 transition-colors"
              >
                Create Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}