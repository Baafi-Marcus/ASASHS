import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';

interface TeacherMessage {
  id: number;
  title: string;
  content: string;
  class_name: string;
  subject_name: string;
  created_at: string;
  is_private: boolean;
}

interface TeacherMessagesProps {
  teacherId: number;
}

export const TeacherMessages: React.FC<TeacherMessagesProps> = ({ teacherId }) => {
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    class_id: '',
    subject_id: '',
    is_private: false,
    recipient_student_id: ''
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await db.getTeacherMessages(teacherId);
      setMessages(data as TeacherMessage[]);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await db.createTeacherMessage({
        ...formData,
        teacher_id: teacherId
      });
      
      toast.success('Message sent successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        content: '',
        class_id: '',
        subject_id: '',
        is_private: false,
        recipient_student_id: ''
      });
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Faculty Communications</h2>
          <p className="text-xs text-gray-500">Broadcast class notices, announcements, and direct student feedback</p>
        </div>
        <PortalButton
          onClick={() => setShowCreateForm(true)}
          variant="primary"
          className="text-xs !min-h-[38px]"
        >
          Compose Message
        </PortalButton>
      </div>

      {/* Messages List */}
      <PortalCard className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Outbox Archive</h3>
            <p className="text-xs text-gray-500 tabular-nums">
              {messages.length} message{messages.length === 1 ? '' : 's'} dispatched
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject & Preview</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Recipient</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject Area</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Audience</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Date Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-xs font-bold text-gray-900">{message.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{message.content}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-700">
                      {message.is_private ? 'Direct Student' : message.class_name || 'All Classes'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-700">
                      {message.subject_name || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold border uppercase tracking-wider ${
                        message.is_private 
                          ? 'bg-purple-50 text-purple-800 border-purple-200' 
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {message.is_private ? 'Private' : 'Class Broadcast'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono tabular-nums text-gray-500 text-right">
                      {new Date(message.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-gray-500">
                    No messages sent yet. Click "Compose Message" to send your first broadcast.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PortalCard>

      {/* Create Message Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <PortalCard className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-base font-bold text-gray-900">Compose Academic Dispatch</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Header *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  placeholder="e.g. Next Week Laboratory Session Preparation"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message Body *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  placeholder="Type official notification message..."
                />
              </div>
              
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_private"
                  name="is_private"
                  checked={formData.is_private}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-school-green-700 border-gray-300 rounded-sm focus:ring-school-green-600"
                />
                <label htmlFor="is_private" className="text-xs font-medium text-gray-700">
                  Send as private 1-on-1 direct message
                </label>
              </div>
              
              {!formData.is_private ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Class Section</label>
                    <select
                      name="class_id"
                      value={formData.class_id}
                      onChange={handleInputChange}
                      className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                    >
                      <option value="">All Assigned Classes</option>
                      <option value="1">General Science 1A</option>
                      <option value="2">General Science 1B</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                    <select
                      name="subject_id"
                      value={formData.subject_id}
                      onChange={handleInputChange}
                      className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                    >
                      <option value="">General Academic Announcement</option>
                      <option value="1">Mathematics</option>
                      <option value="2">Integrated Science</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Student Admission / ID *</label>
                  <input
                    type="text"
                    name="recipient_student_id"
                    value={formData.recipient_student_id}
                    onChange={handleInputChange}
                    required={formData.is_private}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                    placeholder="e.g. STU2026001"
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <PortalButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </PortalButton>
                <PortalButton
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  loadingText="Sending..."
                >
                  Send Message
                </PortalButton>
              </div>
            </form>
          </PortalCard>
        </div>
      )}
    </div>
  );
};