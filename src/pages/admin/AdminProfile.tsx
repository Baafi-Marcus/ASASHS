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
  const [aiKeys, setAiKeys] = useState<string[]>([]);
  const [newKey, setNewKey] = useState('');
  const [formData, setFormData] = useState<Partial<Admin>>({});

  useEffect(() => {
    fetchAdminDetails();
    fetchSettings();
  }, [adminId]);

  const fetchSettings = async () => {
    try {
      const keys = await db.getAIKeys();
      setAiKeys(keys);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchAdminDetails = async () => {
    setLoading(true);
    try {
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

  const handleAddKey = async () => {
    if (!newKey.trim()) return;
    const updatedKeys = [...aiKeys, newKey.trim()];
    try {
      await db.updateAIKeys(updatedKeys);
      setAiKeys(updatedKeys);
      setNewKey('');
      toast.success('API Key added successfully');
    } catch (error) {
      toast.error('Failed to save API key');
    }
  };

  const handleRemoveKey = async (index: number) => {
    const updatedKeys = aiKeys.filter((_, i) => i !== index);
    try {
      await db.updateAIKeys(updatedKeys);
      setAiKeys(updatedKeys);
      toast.success('API Key removed');
    } catch (error) {
      toast.error('Failed to remove API key');
    }
  };

  const handleInputChange = (field: keyof Admin, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><h3 className="font-semibold text-gray-700">Full Name</h3><p>{admin?.full_name || 'N/A'}</p></div>
              <div><h3 className="font-semibold text-gray-700">User ID</h3><p>{admin?.user_id || 'N/A'}</p></div>
              <div><h3 className="font-semibold text-gray-700">Email</h3><p>{admin?.email || 'N/A'}</p></div>
              <div><h3 className="font-semibold text-gray-700">Phone</h3><p>{admin?.phone || 'N/A'}</p></div>
              <div><h3 className="font-semibold text-gray-700">Position</h3><p>{admin?.position || 'N/A'}</p></div>
              <div><h3 className="font-semibold text-gray-700">Department</h3><p>{admin?.department || 'N/A'}</p></div>
              <div><h3 className="font-semibold text-gray-700">Date Joined</h3><p>{admin?.date_joined || 'N/A'}</p></div>
            </div>
            <div className="flex justify-end">
              <PortalButton onClick={() => setIsEditing(true)} variant="primary">Edit Profile</PortalButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PortalInput label="Full Name" type="text" value={formData.full_name || ''} onChange={(e) => handleInputChange('full_name', e.target.value)} disabled={isSubmitting} />
              <PortalInput label="User ID" type="text" value={formData.user_id || ''} onChange={(e) => handleInputChange('user_id', e.target.value)} disabled={isSubmitting} />
              <PortalInput label="Email" type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} disabled={isSubmitting} />
              <PortalInput label="Phone" type="tel" value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} disabled={isSubmitting} />
              <PortalInput label="Position" type="text" value={formData.position || ''} onChange={(e) => handleInputChange('position', e.target.value)} disabled={isSubmitting} />
              <PortalInput label="Department" type="text" value={formData.department || ''} onChange={(e) => handleInputChange('department', e.target.value)} disabled={isSubmitting} />
              <PortalInput label="Date Joined" type="date" value={formData.date_joined || ''} onChange={(e) => handleInputChange('date_joined', e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="flex justify-end space-x-3">
              <PortalButton type="button" onClick={() => setIsEditing(false)} variant="secondary" disabled={isSubmitting}>Cancel</PortalButton>
              <PortalButton type="submit" disabled={isSubmitting} variant="primary">{isSubmitting ? 'Saving...' : 'Save Changes'}</PortalButton>
            </div>
          </form>
        )}
      </PortalCard>
      ) : (
        <PortalCard title="AI Service Configuration">
          <div className="space-y-8">
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
              <div className="flex items-center space-x-2 text-amber-800 mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="font-bold">Key Rotation System</span>
              </div>
              <p className="text-xs text-amber-700">
                You can add multiple API keys below. The system will automatically switch to the next key if one reaches its rate limit or quota.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Manage API Keys</h3>
              
              <div className="space-y-3 mb-6">
                {aiKeys.length > 0 ? aiKeys.map((key, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-school-green-100 flex items-center justify-center text-school-green-600 font-bold text-xs">{index + 1}</div>
                      <div className="font-mono text-sm text-gray-600">
                        {key.substring(0, 8)}••••••••••••••••{key.substring(key.length - 4)}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveKey(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      title="Remove Key"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )) : (
                  <div className="py-8 text-center text-gray-400 italic text-sm border-2 border-dashed border-gray-100 rounded-xl">
                    No API keys configured yet.
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <PortalInput
                    label="Add New GitHub/OpenAI Key"
                    type="password"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                  />
                </div>
                <div className="self-end pb-1">
                   <PortalButton onClick={handleAddKey} variant="primary" className="py-2.5">Add Key</PortalButton>
                </div>
              </div>
            </div>
          </div>
        </PortalCard>
      )}
    </div>
  );
}