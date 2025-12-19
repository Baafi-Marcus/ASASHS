import React, { useState } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { PortalInput } from '../../components/PortalInput';

interface TeacherProfileProps {
  teacher: any;
  onLogout: () => void;
}

export const TeacherProfile: React.FC<TeacherProfileProps> = ({ teacher, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
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
    
    try {
      // In a real implementation, you would call an API to change the password
      // await db.changePassword(teacher.teacherId, passwordData.newPassword);
      toast.success('Password changed successfully!');
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password');
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
          <p className="text-gray-600">Manage your personal information and account settings</p>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-school-green-500 text-school-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-school-green-500 text-school-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
        </nav>
      </div>

      {/* Profile Information */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <PortalCard>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-school-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl text-school-green-600">
                    {teacher.fullName.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{teacher.fullName}</h3>
                <p className="text-gray-600">{teacher.department}</p>
                <p className="text-sm text-gray-500 mt-1">Teacher ID: {teacher.teacherId}</p>
                
                <div className="mt-6 w-full space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Classes</span>
                    <span className="font-medium">{teacher.classes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subjects</span>
                    <span className="font-medium">{teacher.subjects.length}</span>
                  </div>
                </div>
              </div>
            </PortalCard>
          </div>
          
          {/* Profile Details */}
          <div className="lg:col-span-2">
            <PortalCard title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="px-4 py-3 bg-school-cream-100 rounded-lg text-gray-900">
                    {teacher.fullName}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher ID</label>
                  <div className="px-4 py-3 bg-school-cream-100 rounded-lg text-gray-900">
                    {teacher.teacherId}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="px-4 py-3 bg-school-cream-100 rounded-lg text-gray-900">
                    teacher@example.com
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="px-4 py-3 bg-school-cream-100 rounded-lg text-gray-900">
                    +233 24 123 4567
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <div className="px-4 py-3 bg-school-cream-100 rounded-lg text-gray-900">
                    {teacher.department}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <div className="px-4 py-3 bg-school-cream-100 rounded-lg text-gray-900">
                    Senior Teacher
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <div className="px-4 py-3 bg-school-cream-100 rounded-lg text-gray-900">
                  123 Education Street, Accra, Ghana
                </div>
              </div>
              
              <div className="mt-6 flex space-x-4">
                <PortalButton variant="primary">
                  Edit Profile
                </PortalButton>
                <PortalButton 
                  onClick={() => setShowChangePassword(true)}
                  variant="outline"
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
        <PortalCard title="Security Settings">
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 border border-school-cream-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <PortalButton variant="primary">
                Enable
              </PortalButton>
            </div>
            
            <div className="flex justify-between items-center p-4 border border-school-cream-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Login History</h4>
                <p className="text-sm text-gray-500">View your recent login activity</p>
              </div>
              <PortalButton variant="outline">
                View
              </PortalButton>
            </div>
            
            <div className="flex justify-between items-center p-4 border border-school-cream-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Active Sessions</h4>
                <p className="text-sm text-gray-500">Manage devices that are currently logged in</p>
              </div>
              <PortalButton 
                onClick={onLogout}
                variant="danger"
              >
                Sign Out All Devices
              </PortalButton>
            </div>
          </div>
        </PortalCard>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-school-green-700 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Change Password</h2>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6 space-y-6">
              <div>
                <PortalInput
                  label="Current Password"
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <PortalInput
                  label="New Password"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <PortalInput
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm new password"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
                >
                  Change Password
                </PortalButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};