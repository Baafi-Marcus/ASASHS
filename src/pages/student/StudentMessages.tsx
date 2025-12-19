import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Message {
  id: number;
  sender: string;
  senderRole: 'teacher' | 'admin';
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export const StudentMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    content: ''
  });

  useEffect(() => {
    // In a real implementation, this would fetch from the database
    // For now, we'll use mock data
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          sender: 'Mr. Johnson',
          senderRole: 'teacher',
          subject: 'Assignment Submission',
          content: 'Please remember to submit your mathematics assignment by Friday.',
          timestamp: '2025-04-10 14:30',
          read: false
        },
        {
          id: 2,
          sender: 'Admin Office',
          senderRole: 'admin',
          subject: 'School Event',
          content: 'There will be a parent-teacher meeting next week. Please inform your parents.',
          timestamp: '2025-04-08 09:15',
          read: true
        },
        {
          id: 3,
          sender: 'Mrs. Smith',
          senderRole: 'teacher',
          subject: 'Outstanding Fees',
          content: 'Please remind your parents to clear the outstanding fees as soon as possible.',
          timestamp: '2025-04-05 16:45',
          read: true
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleCompose = () => {
    setShowCompose(true);
    setSelectedMessage(null);
  };

  const handleSendMessage = () => {
    if (!newMessage.recipient || !newMessage.subject || !newMessage.content) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // In a real implementation, this would send to the database
    toast.success('Message sent successfully!');
    setShowCompose(false);
    setNewMessage({ recipient: '', subject: '', content: '' });
  };

  const handleMarkAsRead = (id: number) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    ));
  };

  const getSenderColor = (role: string) => {
    return role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <button
            onClick={handleCompose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Compose Message</span>
          </button>
        </div>
      </div>

      {showCompose ? (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Compose New Message</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
              <select
                value={newMessage.recipient}
                onChange={(e) => setNewMessage({...newMessage, recipient: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select recipient</option>
                <option value="class-teacher">Class Teacher</option>
                <option value="subject-teacher">Subject Teacher</option>
                <option value="admin">Admin Office</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter subject"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Type your message here..."
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      ) : selectedMessage ? (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedMessage(null)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Inbox
            </button>
            
            {!selectedMessage.read && (
              <button
                onClick={() => handleMarkAsRead(selectedMessage.id)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark as Read
              </button>
            )}
          </div>
          
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSenderColor(selectedMessage.senderRole)}`}>
                {selectedMessage.sender}
              </span>
              <span>{selectedMessage.timestamp}</span>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{selectedMessage.content}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.read) {
                      handleMarkAsRead(message.id);
                    }
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                    message.read 
                      ? 'border-gray-200 bg-white' 
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {!message.read && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSenderColor(message.senderRole)}`}>
                        {message.sender}
                      </span>
                      <h3 className="font-medium text-gray-900">{message.subject}</h3>
                    </div>
                    <span className="text-sm text-gray-500">{message.timestamp}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{message.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-3">✉️</div>
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm">Your messages will appear here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};