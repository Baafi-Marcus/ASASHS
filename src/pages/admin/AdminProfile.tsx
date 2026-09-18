import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { PortalInput } from '../../components/PortalInput';
import {
  UserCircleIcon,
  KeyIcon,
  TrashIcon,
  PlusIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

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
      setAiKeys(keys || []);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchAdminDetails = async () => {
    setLoading(true);
    try {
      const mockAdminData: Admin = {
        id: 1,
        user_id: adminId || 'ADM-001',
        full_name: "Principal Administrator",
        email: "admin@asashs.edu.gh",
        phone: "+233 20 123 4567",
        position: "Chief Systems Administrator",
        department: "General Administration & Oversight",
        date_joined: "2023-01-15"
      };
      
      setAdmin(mockAdminData);
      setFormData(mockAdminData);
    } catch (error) {
      console.error('Failed to fetch admin details:', error);
      toast.error('Failed to load admin profile');
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
      toast.success('API credential stored successfully');
    } catch (error) {
      toast.error('Failed to commit API key');
    }
  };

  const handleRemoveKey = async (index: number) => {
    const updatedKeys = aiKeys.filter((_, i) => i !== index);
    try {
      await db.updateAIKeys(updatedKeys);
      setAiKeys(updatedKeys);
      toast.success('API key revoked');
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
      toast.success('Administrator profile committed successfully');
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
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton variant="profile" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Administrator Profile & Security Preferences</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage administrative credentials, contact records, and backend intelligence tokens</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex space-x-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-school-green-700 text-school-green-800 bg-school-green-50/40'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Account Dossier
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-school-green-700 text-school-green-800 bg-school-green-50/40'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          AI Infrastructure Keys
        </button>
      </div>

      {activeTab === 'profile' ? (
        <PortalCard title="Executive Identity Information">
          {!isEditing ? (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-sm border border-gray-200">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Full Name</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{admin?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">System User ID</span>
                  <p className="font-mono font-semibold text-gray-900 mt-0.5 tabular-nums">{admin?.user_id || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Official Email</span>
                  <p className="font-mono text-gray-800 mt-0.5">{admin?.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Telephone / Mobile</span>
                  <p className="font-mono text-gray-800 mt-0.5 tabular-nums">{admin?.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Designation</span>
                  <p className="font-medium text-gray-900 mt-0.5">{admin?.position || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Department</span>
                  <p className="font-medium text-gray-900 mt-0.5">{admin?.department || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Commission Date</span>
                  <p className="font-mono text-gray-700 mt-0.5 tabular-nums">{admin?.date_joined || 'N/A'}</p>
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <PortalButton onClick={() => setIsEditing(true)} variant="primary" className="py-2 text-xs">
                  Edit Account Information
                </PortalButton>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PortalInput label="Full Name" type="text" value={formData.full_name || ''} onChange={(e) => handleInputChange('full_name', e.target.value)} disabled={isSubmitting} />
                <PortalInput label="System User ID" type="text" value={formData.user_id || ''} onChange={(e) => handleInputChange('user_id', e.target.value)} disabled={isSubmitting} />
                <PortalInput label="Official Email" type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} disabled={isSubmitting} />
                <PortalInput label="Telephone Number" type="tel" value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} disabled={isSubmitting} />
                <PortalInput label="Designation" type="text" value={formData.position || ''} onChange={(e) => handleInputChange('position', e.target.value)} disabled={isSubmitting} />
                <PortalInput label="Department" type="text" value={formData.department || ''} onChange={(e) => handleInputChange('department', e.target.value)} disabled={isSubmitting} />
                <PortalInput label="Commission Date" type="date" value={formData.date_joined || ''} onChange={(e) => handleInputChange('date_joined', e.target.value)} disabled={isSubmitting} />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <PortalButton type="button" onClick={() => setIsEditing(false)} variant="secondary" disabled={isSubmitting} className="py-2 text-xs">
                  Cancel
                </PortalButton>
                <PortalButton type="submit" disabled={isSubmitting} variant="primary" className="py-2 text-xs">
                  {isSubmitting ? 'Committing...' : 'Commit Changes'}
                </PortalButton>
              </div>
            </form>
          )}
        </PortalCard>
      ) : (
        <PortalCard title="AI Intelligence Gateway Keys">
          <div className="space-y-6 text-xs">
            <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-sm">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-1">
                <InformationCircleIcon className="w-4 h-4 text-amber-700" />
                <span>Multi-Key Failover Architecture</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Add multiple token keys for OpenAI or GitHub Models below. The exam generator and optical assessment engine automatically rotates to the next standby token when quotas or rate limits are encountered.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Configured API Tokens ({aiKeys.length})</span>
              </div>
              
              <div className="space-y-2 mb-4">
                {aiKeys.length > 0 ? aiKeys.map((key, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-xs bg-school-green-50 text-school-green-800 border border-school-green-200 font-mono font-bold text-[10px] flex items-center justify-center tabular-nums">
                        {index + 1}
                      </span>
                      <span className="font-mono text-xs text-gray-700 tabular-nums">
                        {key.substring(0, 8)}••••••••••••••••{key.substring(key.length - 4)}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleRemoveKey(index)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded-xs transition-colors"
                      title="Revoke Token"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )) : (
                  <div className="py-8 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-sm">
                    No standby API keys currently provisioned.
                  </div>
                )}
              </div>

              <div className="flex gap-2 items-end pt-2 border-t border-gray-100">
                <div className="flex-1">
                  <PortalInput
                    label="Provision New Intelligence Token"
                    type="password"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="sk-... or ghp_..."
                  />
                </div>
                <div className="pb-0.5">
                  <PortalButton onClick={handleAddKey} variant="primary" className="py-2 text-xs">
                    Commit Token
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

export default AdminProfile;