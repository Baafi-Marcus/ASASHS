import React, { useState, useEffect } from 'react';
import { db } from '../../lib/neon';
import toast from 'react-hot-toast';

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

interface AnnouncementsSidebarProps {
  userId: number;
  userType: string;
  classId?: number; // For teacher announcements
}

export function AnnouncementsSidebar({ userId, userType, classId }: AnnouncementsSidebarProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      let data;
      
      if (userType === 'teacher' && classId) {
        // For teachers, fetch announcements for their specific class plus school-wide announcements
        data = await db.getAnnouncements(classId);
      } else {
        // For admins and students, fetch all announcements
        data = await db.getAnnouncements();
      }
      
      setAnnouncements(data as Announcement[]);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
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
        created_by: userId,
        class_id: userType === 'teacher' ? classId : undefined // Only teachers can create class-specific announcements
      };
      
      await db.createAnnouncement(announcementData);
      setNewAnnouncement({ title: '', content: '' });
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

  // For students, don't show the announcements sidebar
  if (userType === 'student') {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <span className="w-6 h-6 bg-school-green-600 rounded-lg flex items-center justify-center text-white mr-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
          </span>
          Announcements
        </h3>
        {(userType === 'admin' || userType === 'teacher') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-2 py-1 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 transition-colors text-xs font-medium"
          >
            + New
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-school-green-200 border-t-school-green-600"></div>
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {announcements.slice(0, 5).map((announcement) => (
            <div key={announcement.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-800 text-sm">{announcement.title}</h4>
                {(userType === 'admin' || (userType === 'teacher' && announcement.created_by === userId)) && (
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-xs mt-1 line-clamp-2">{announcement.content}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(announcement.created_at).toLocaleDateString()}
                </span>
                <div className="flex space-x-1">
                  {announcement.class_name && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      {announcement.class_name}
                    </span>
                  )}
                  <span className="text-xs bg-school-green-100 text-school-green-800 px-1.5 py-0.5 rounded">
                    {announcement.created_by_user_id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-gray-400 text-2xl mb-2">📢</div>
          <p className="text-gray-500 text-sm">No announcements yet</p>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-school-green-700 px-4 py-3 rounded-t-2xl">
              <h2 className="text-lg font-bold text-white">
                {userType === 'teacher' ? 'Create Class Announcement' : 'Create School Announcement'}
              </h2>
            </div>
            <div className="p-4 space-y-3">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  placeholder="Announcement content"
                />
              </div>
              {userType === 'teacher' && (
                <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  This announcement will be visible only to students in your class.
                </div>
              )}
              {userType === 'admin' && (
                <div className="text-xs text-gray-500 bg-green-50 p-2 rounded">
                  This announcement will be visible to the entire school.
                </div>
              )}
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
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}