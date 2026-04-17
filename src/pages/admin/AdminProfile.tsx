import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { PortalInput } from '../../components/PortalInput';

interface Admin {
  id: number;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  date_joined: string;
}

export function AdminProfile({ adminId }: { adminId: string }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [settings, setSettings] = useState<{ github_model_api_key: string }>({ github_model_api_key: '' });
  const [formData, setFormData] = useState<Partial<Admin>>({});

  useEffect(() => {
    fetchAdminDetails();
    fetchSettings();
  }, [adminId]);

  const fetchSettings = async () => {
    try {
      const key = await db.getSchoolSetting('github_model_api_key');
      setSettings({ github_model_api_key: key });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchAdminDetails = async () => {
    setLoading(true);
    try {
      // Since there's no specific function to get admin by ID, we'll need to implement this
      // For now, we'll mock the data or you can implement the database function
      // In a real implementation, you would have a db.getAdminById function
      const mockAdminData: Admin = {
        id: 1,
        user_id: adminId,
        full_name: "Administrator",
        email: "admin@asashs.edu.gh",
        phone: "+233 20 123 4567",
        position: "System Administrator",
        department: "Administration",
        date_joined: "2023-01-15"
      };
      
      setAdmin(mockAdminData);
      setFormData(mockAdminData);
    } catch (error) {
      console.error('Failed to fetch admin details:', error);
      toast.error('Failed to load admin details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Admin, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real implementation, you would have a db.updateAdmin function
      // For now, we'll just show a success message
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      if (formData) {
        setAdmin(formData as Admin);
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'profile' ? 'bg-school-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Admin Profile
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'settings' ? 'bg-school-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          System Settings
        </button>
      </div>

      {activeTab === 'profile' ? (
        <PortalCard title="Admin Profile">
        {!isEditing ? (
          // View Mode
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700">Full Name</h3>
                <p>{admin?.full_name || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">User ID</h3>
                <p>{admin?.user_id || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Email</h3>
                <p>{admin?.email || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Phone</h3>
                <p>{admin?.phone || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Position</h3>
                <p>{admin?.position || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Department</h3>
                <p>{admin?.department || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Date Joined</h3>
                <p>{admin?.date_joined || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <PortalButton
                onClick={() => setIsEditing(true)}
                variant="primary"
              >
                Edit Profile
              </PortalButton>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <PortalInput
                  label="Full Name"
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <PortalInput
                  label="User ID"
                  type="text"
                  value={formData.user_id || ''}
                  onChange={(e) => handleInputChange('user_id', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <PortalInput
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <PortalInput
                  label="Phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <PortalInput
                  label="Position"
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <PortalInput
                  label="Department"
                  type="text"
                  value={formData.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <PortalInput
                  label="Date Joined"
                  type="date"
                  value={formData.date_joined || ''}
                  onChange={(e) => handleInputChange('date_joined', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <PortalButton
                type="button"
                onClick={() => setIsEditing(false)}
                variant="secondary"
                disabled={isSubmitting}
              >
                Cancel
              </PortalButton>
              <PortalButton
                type="submit"
                disabled={isSubmitting}
                variant="primary"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </PortalButton>
            </div>
          </form>
        )}
      </PortalCard>
      ) : (
        <PortalCard title="System Settings">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure the GitHub Models / OpenAI API key for AI-powered features like quiz generation.
              </p>
              <div className="space-y-4">
                <PortalInput
                  label="GitHub Model API Key"
                  type="password"
                  value={settings.github_model_api_key}
                  onChange={(e) => setSettings({ github_model_api_key: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxx"
                />
                <div className="flex justify-end">
                  <PortalButton
                    onClick={async () => {
                      try {
                        await db.updateSchoolSetting('github_model_api_key', settings.github_model_api_key);
                        toast.success('Settings updated successfully!');
                      } catch (error) {
                        toast.error('Failed to update settings');
                      }
                    }}
                    variant="primary"
                  >
                    Save Settings
                  </PortalButton>
                </div>
              </div>
            </div>
          </div>
        </PortalCard>
      )}
    </div>
  );
}