import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { PortalInput } from '../../components/PortalInput';
import { UserAvatar } from '../../components/UserAvatar';

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
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    content: ''
  });

  useEffect(() => {
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          sender: 'Mr. Johnson',
          senderRole: 'teacher',
          subject: 'Assignment Submission Reminder',
          content: 'Please remember to submit your mathematics assignment on quadratic equations by Friday before 5:00 PM.',
          timestamp: '2025-04-10 14:30',
          read: false
        },
        {
          id: 2,
          sender: 'Admin Office',
          senderRole: 'admin',
          subject: 'Semester Mid-Term Notice',
          content: 'Academic mid-term assessments will begin on the 24th. The official timetable is now available under School Exams.',
          timestamp: '2025-04-08 09:15',
          read: true
        },
        {
          id: 3,
          sender: 'Mrs. Smith',
          senderRole: 'teacher',
          subject: 'Integrated Science Lab Safety',
          content: 'Kindly bring your safety goggles and lab manual for tomorrow morning session at the chemistry laboratory.',
          timestamp: '2025-04-05 16:45',
          read: true
        }
      ]);
      setLoading(false);
    }, 300);
  }, []);

  const handleCompose = () => {
    setShowCompose(true);
    setSelectedMessage(null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.recipient || !newMessage.subject || !newMessage.content) {
      toast.error('Please fill in all message fields');
      return;
    }
    
    setIsSending(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      toast.success('Message sent successfully');
      setShowCompose(false);
      setNewMessage({ recipient: '', subject: '', content: '' });
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsRead = (id: number) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    ));
  };

  const unreadCount = messages.filter(m => !m.read).length;
  const displayUnread = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md p-5 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900 tracking-tight">Direct Communications</h2>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold tabular-nums px-2 py-0.2 rounded-sm bg-school-green-50 text-school-green-800 border border-school-green-200">
                  {displayUnread} new
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Notices and direct messages from teachers and administration</p>
          </div>
        </div>
        
        <PortalButton
          size="sm"
          variant="primary"
          onClick={handleCompose}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Message
        </PortalButton>
      </div>

      {showCompose ? (
        <PortalCard title="Compose Direct Message">
          <div className="space-y-4 max-w-2xl">
            <PortalInput
              label="Recipient"
              as="select"
              value={newMessage.recipient}
              onChange={(e) => setNewMessage({...newMessage, recipient: e.target.value})}
            >
              <option value="">Select official recipient...</option>
              <option value="class-teacher">Form Master / Class Teacher</option>
              <option value="subject-teacher">Subject Tutor</option>
              <option value="admin">Academic Affairs / Administration</option>
            </PortalInput>
            
            <PortalInput
              label="Subject Title"
              type="text"
              value={newMessage.subject}
              onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
              placeholder="e.g. Inquiry regarding assignment deadline"
            />
            
            <PortalInput
              label="Message Body"
              as="textarea"
              rows={5}
              value={newMessage.content}
              onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
              placeholder="Write your detailed inquiry or note here..."
            />
            
            <div className="flex justify-end gap-2.5 pt-2">
              <PortalButton
                variant="outline"
                size="sm"
                onClick={() => setShowCompose(false)}
                disabled={isSending}
              >
                Cancel
              </PortalButton>
              <PortalButton
                variant="primary"
                size="sm"
                loading={isSending}
                loadingText="Sending Message..."
                onClick={handleSendMessage}
              >
                Send Message
              </PortalButton>
            </div>
          </div>
        </PortalCard>
      ) : selectedMessage ? (
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <button
              onClick={() => setSelectedMessage(null)}
              className="min-h-[36px] text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-school-green-700"
            >
              <span aria-hidden="true">&larr;</span>
              <span>Back to Communications</span>
            </button>
            
            {!selectedMessage.read && (
              <button
                onClick={() => handleMarkAsRead(selectedMessage.id)}
                className="text-xs font-medium text-school-green-800 hover:underline"
              >
                Mark as Read
              </button>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <UserAvatar name={selectedMessage.sender} size="md" />
                <div>
                  <h3 className="text-base font-semibold text-gray-900 leading-snug">{selectedMessage.subject}</h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                    <span className="font-semibold text-gray-900">{selectedMessage.sender}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedMessage.senderRole}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400 tabular-nums self-start sm:self-auto">{selectedMessage.timestamp}</span>
            </div>
            
            <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed max-w-3xl">
              {selectedMessage.content}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-school-green-200 border-t-school-green-700"></div>
            </div>
          ) : messages.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.read) {
                      handleMarkAsRead(message.id);
                    }
                  }}
                  className={`p-4 cursor-pointer transition-colors duration-fast ease-standard flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    message.read 
                      ? 'bg-white hover:bg-gray-50' 
                      : 'bg-school-green-50/40 hover:bg-school-green-50/70 border-l-2 border-l-school-green-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <UserAvatar name={message.sender} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs truncate ${message.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                          {message.sender}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">({message.senderRole})</span>
                      </div>
                      <h3 className={`text-xs truncate mt-0.5 ${message.read ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                        {message.subject}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{message.content}</p>
                    </div>
                  </div>
                  
                  <span className="text-[11px] text-gray-400 tabular-nums self-end sm:self-center flex-shrink-0">
                    {message.timestamp}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-500">
              No communication records in your inbox.
            </div>
          )}
        </div>
      )}
    </div>
  );
};