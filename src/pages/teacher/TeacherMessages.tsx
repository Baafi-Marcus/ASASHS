import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
          <p className="text-gray-600">Communicate with students and classes</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-school-green-600 text-white px-6 py-3 rounded-lg hover:bg-school-green-700 transition-colors flex items-center space-x-2"
        >
          <span>✉️</span>
          <span>Send Message</span>
        </button>
      </div>

      {/* Create Message Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-school-green-700 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Send New Message</h2>
            </div>
            
            <form onSubmit={handleCreateMessage} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  placeholder="Message subject"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={5}
                  required
                  className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  placeholder="Write your message here..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_private"
                  checked={formData.is_private}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-school-green-600 border-gray-300 rounded focus:ring-school-green-500"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Send as private message to specific student
                </label>
              </div>
              
              {!formData.is_private ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                    <select
                      name="class_id"
                      value={formData.class_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                    >
                      <option value="">Select Class (Optional)</option>
                      <option value="1">General Science 1A</option>
                      <option value="2">General Science 1B</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select
                      name="subject_id"
                      value={formData.subject_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                    >
                      <option value="">Select Subject (Optional)</option>
                      <option value="1">Mathematics</option>
                      <option value="2">Integrated Science</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    name="recipient_student_id"
                    value={formData.recipient_student_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                    placeholder="Enter student ID"
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-school-green-600 text-white p-6">
          <h3 className="text-xl font-bold">My Messages</h3>
          <p className="text-school-green-100">
            {messages.length} messages sent
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-school-cream-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Class/Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-school-cream-200">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <tr key={message.id} className="hover:bg-school-cream-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{message.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{message.content}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {message.is_private ? 'Private' : message.class_name || 'All Classes'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {message.subject_name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        message.is_private 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {message.is_private ? 'Private' : 'Class'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(message.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <button className="text-school-green-600 hover:text-school-green-800 mr-3">
                        View
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-4">✉️</div>
                      <p className="text-lg font-medium">No messages sent yet</p>
                      <p className="text-sm">Send your first message to communicate with students</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};