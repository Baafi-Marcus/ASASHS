import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';

export function AdminAiSettings() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key_value.trim()) return toast.error('Key is required');
    try {
      await db.saveAiApiKey(formData);
      toast.success('API Key saved successfully');
      setShowModal(false);
      setFormData({ provider: 'gemini', key_value: '', priority: 0 });
      fetchKeys();
    } catch (error) {
      toast.error('Failed to save API Key');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this key?')) return;
    try {
      await db.deleteAiApiKey(id);
      toast.success('Deleted successfully');
      fetchKeys();
    } catch (error) {
      toast.error('Failed to delete');
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
    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI API Settings</h2>
          <p className="text-gray-600">Manage fallback API keys for the Smart Exam Builder.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-school-green-600 text-white rounded-xl font-bold hover:bg-school-green-700">
          Add API Key
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 font-bold text-gray-700">Provider</th>
              <th className="px-6 py-4 font-bold text-gray-700">Key (Hidden)</th>
              <th className="px-6 py-4 font-bold text-gray-700">Priority (Lower=First)</th>
              <th className="px-6 py-4 font-bold text-gray-700">Last Failed</th>
              <th className="px-6 py-4 font-bold text-gray-700">Status</th>
              <th className="px-6 py-4 font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-bold uppercase text-xs">{key.provider}</td>
                <td className="px-6 py-4 text-gray-500 font-mono">••••••••{key.key_value.slice(-4)}</td>
                <td className="px-6 py-4">{key.priority}</td>
                <td className="px-6 py-4 text-red-500 text-sm">{key.last_failed_at ? new Date(key.last_failed_at).toLocaleString() : 'Never'}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(key)} className={`px-3 py-1 rounded-full text-xs font-bold ${key.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {key.is_active ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(key.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No API keys configured. The Smart Exam Builder will not work.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add API Key</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <select value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-school-green-500 focus:ring-2 focus:ring-school-green-200 outline-none">
                    <option value="gemini">Google Gemini (Gemini-1.5-Flash)</option>
                    <option value="openai">OpenAI (GPT-4o-Mini)</option>
                    <option value="github">GitHub Models (GPT-4o)</option>
                  </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input type="text" required value={formData.key_value} onChange={e => setFormData({...formData, key_value: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-school-green-500 outline-none" placeholder="sk-..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority (0 is highest)</label>
                <input type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-school-green-500 outline-none" />
                <p className="text-xs text-gray-500 mt-1">The system attempts keys in order of priority. If one fails, it falls back to the next.</p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-school-green-600 text-white rounded-xl font-bold hover:bg-school-green-700 shadow-md shadow-school-green-600/20">Save Key</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
