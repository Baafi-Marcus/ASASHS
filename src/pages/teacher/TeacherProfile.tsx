import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { PortalInput } from '../../components/PortalInput';
import { UserAvatar } from '../../components/UserAvatar';

interface TeacherProfileProps {
  teacher: any;
  onLogout: () => void;
}

export const TeacherProfile: React.FC<TeacherProfileProps> = ({ teacher, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 600));
      toast.success('Password updated successfully');
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Staff Account Settings</h2>
        <p className="text-xs text-gray-500">Manage institutional credentials, security settings, and profile information</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`min-h-[44px] py-3 px-1 border-b-2 font-semibold text-xs transition-colors ${
              activeTab === 'profile'
                ? 'border-school-green-700 text-school-green-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`min-h-[44px] py-3 px-1 border-b-2 font-semibold text-xs transition-colors ${
              activeTab === 'security'
                ? 'border-school-green-700 text-school-green-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Account Security
          </button>
        </nav>
      </div>

      {/* Profile Info */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <PortalCard className="p-6 text-center">
              <div className="flex flex-col items-center">
                <UserAvatar name={teacher.fullName} size="xl" />
                <h3 className="text-base font-bold text-gray-900 mt-3">{teacher.fullName}</h3>
                <p className="text-xs text-gray-500">{teacher.department ? `${teacher.department} Faculty` : 'Staff Faculty'}</p>
                <div className="mt-2 inline-block px-2 py-0.5 rounded-sm bg-gray-50 border border-gray-200 text-[11px] font-mono tabular-nums text-gray-600">
                  ID: {teacher.teacherId}
                </div>
                
                <div className="mt-6 w-full pt-4 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500">Classes Assigned</span>
                    <span className="font-bold text-gray-900 tabular-nums">{teacher.classes?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500">Subject Portfolios</span>
                    <span className="font-bold text-gray-900 tabular-nums">{teacher.subjects?.length || 1}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500">Institutional Role</span>
                    <span className="font-semibold text-school-green-800">Faculty Instructor</span>
                  </div>
                </div>
              </div>
            </PortalCard>
          </div>
          
          {/* Profile Details */}
          <div className="lg:col-span-2">
            <PortalCard className="p-6">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Official Records</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Legal Name</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-sm border border-gray-200 text-xs font-semibold text-gray-900">
                    {teacher.fullName}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Staff Teacher ID</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-sm border border-gray-200 text-xs font-mono font-bold text-gray-900 tabular-nums">
                    {teacher.teacherId}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Institutional Email</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-sm border border-gray-200 text-xs text-gray-700">
                    {teacher.email || 'faculty@asashs.edu.gh'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Contact Phone</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-sm border border-gray-200 text-xs font-mono tabular-nums text-gray-700">
                    {teacher.phone || '+233 24 000 0000'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Academic Department</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-sm border border-gray-200 text-xs text-gray-700">
                    {teacher.department || 'General Academics'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Rank / Position</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-sm border border-gray-200 text-xs text-gray-700">
                    Senior Subject Master
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                <PortalButton 
                  onClick={() => setShowChangePassword(true)}
                  variant="secondary"
                  className="text-xs"
                >
                  Change Password
                </PortalButton>
              </div>
            </PortalCard>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <PortalCard className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Security & Device Sessions</h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-gray-200 rounded-sm">
            <div>
              <h4 className="font-bold text-xs text-gray-900">Two-Factor Authentication</h4>
              <p className="text-[11px] text-gray-500">Require an authenticator PIN when logging into staff portals</p>
            </div>
            <PortalButton variant="secondary" className="text-xs !min-h-[36px] !py-1">
              Configure 2FA
            </PortalButton>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-gray-200 rounded-sm">
            <div>
              <h4 className="font-bold text-xs text-gray-900">Session Activity</h4>
              <p className="text-[11px] text-gray-500">Inspect active desktop or tablet sessions logged in with your account</p>
            </div>
            <PortalButton 
              onClick={onLogout}
              variant="danger"
              className="text-xs !min-h-[36px] !py-1"
            >
              Sign Out All Sessions
            </PortalButton>
          </div>
        </PortalCard>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <PortalCard className="w-full max-w-md p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-base font-bold text-gray-900">Change Account Password</h2>
              <button onClick={() => setShowChangePassword(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <PortalInput
                id="currentPassword"
                label="Current Password"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                required
                placeholder="Enter current password"
              />
              
              <PortalInput
                id="newPassword"
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                required
                placeholder="Minimum 6 characters"
              />
              
              <PortalInput
                id="confirmPassword"
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Re-enter new password"
              />
              
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <PortalButton
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  variant="secondary"
                >
                  Cancel
                </PortalButton>
                <PortalButton
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  loadingText="Updating..."
                >
                  Save Password
                </PortalButton>
              </div>
            </form>
          </PortalCard>
        </div>
      )}
    </div>
  );
};