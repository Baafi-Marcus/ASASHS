import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import {
  CpuChipIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { PortalButton } from '../../components/PortalButton';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

export function AdminAiSettings() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ provider: 'gemini', key_value: '', priority: 0 });

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const data = await db.getAiApiKeys();
      setKeys(data || []);
    } catch (error) {
      toast.error('Failed to load intelligence keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key_value.trim()) return toast.error('Key value is required');
    try {
      setIsSubmitting(true);
      await db.saveAiApiKey(formData);
      toast.success('API credential committed successfully');
      setShowModal(false);
      setFormData({ provider: 'gemini', key_value: '', priority: 0 });
      fetchKeys();
    } catch (error) {
      toast.error('Failed to commit API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to revoke this API credential?')) return;
    try {
      await db.deleteAiApiKey(id);
      toast.success('API key revoked');
      fetchKeys();
    } catch (error) {
      toast.error('Failed to revoke key');
    }
  };

  const toggleStatus = async (key: any) => {
    try {
      await db.saveAiApiKey({ id: key.id, provider: key.provider, key_value: key.key_value, is_active: !key.is_active });
      fetchKeys();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">AI Gateway Credentials & Model Providers</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage prioritized model keys for AI exam generation, question extraction, and marking</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="px-4 py-2 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors shadow-2xs flex items-center gap-1.5"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Provision API Key</span>
        </button>
      </div>

      <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton variant="table" rows={4} columns={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Model Provider</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Masked Key</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Failover Priority</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Last Encountered Quota/Error</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold uppercase text-[11px] text-gray-900">{key.provider}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono tabular-nums">••••••••{key.key_value.slice(-4)}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-gray-700">
                      Priority {key.priority} {key.priority === 0 ? '(Primary)' : ''}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500 tabular-nums">
                      {key.last_failed_at ? new Date(key.last_failed_at).toLocaleString() : 'Normal Operation'}
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => toggleStatus(key)} 
                        className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold border transition-colors ${
                          key.is_active 
                            ? 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100' 
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {key.is_active ? 'Active' : 'Standby / Disabled'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleDelete(key.id)} 
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
                {keys.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-xs text-gray-400">
                      No AI provider credentials provisioned. Click "Provision API Key" to enable AI capabilities.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Provision Model Provider Key</h3>
                <p className="text-xs text-gray-500 mt-0.5">Register authentication tokens for exam intelligence</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-sm"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Model Provider Platform</label>
                <select 
                  value={formData.provider} 
                  onChange={e => setFormData({...formData, provider: e.target.value})} 
                  className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white"
                >
                  <option value="gemini">Google Gemini (Gemini 1.5 Flash)</option>
                  <option value="openai">OpenAI (GPT-4o-mini)</option>
                  <option value="github">GitHub Models (GPT-4o)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Authentication Key *</label>
                <input 
                  type="password" 
                  required 
                  value={formData.key_value} 
                  onChange={e => setFormData({...formData, key_value: e.target.value})} 
                  className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white font-mono" 
                  placeholder="sk-... or ghp_..." 
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Failover Priority (0 = Highest)</label>
                <input 
                  type="number" 
                  value={formData.priority} 
                  onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})} 
                  className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white tabular-nums" 
                />
                <p className="text-[11px] text-gray-400 mt-1">Lower priority values are invoked first before falling back to subsequent tokens.</p>
              </div>
              
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <PortalButton 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors shadow-2xs"
                >
                  {isSubmitting ? 'Saving...' : 'Commit Credential'}
                </PortalButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAiSettings;
