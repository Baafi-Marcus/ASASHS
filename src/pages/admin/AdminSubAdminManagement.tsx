import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';

export function AdminSubAdminManagement() {
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminName, setNewAdminName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ id: string; tempPass: string; name: string } | null>(null);

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      const admins = await db.getSubAdmins();
      setSubAdmins(admins);
    } catch (error) {
      toast.error('Failed to load sub-admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim()) return;
    try {
      setIsSubmitting(true);
      const newAdmin = await db.createSubAdmin(newAdminName);
      toast.success('Sub-Admin created successfully');
      setCreatedCredentials({
        id: newAdmin.user_id,
        tempPass: newAdmin.temp_password,
        name: newAdmin.full_name
      });
      setNewAdminName('');
      fetchSubAdmins();
    } catch (error) {
      toast.error('Failed to create sub-admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this sub-admin? This cannot be undone.')) return;
    try {
      await db.deleteSubAdmin(id);
      toast.success('Sub-admin deleted');
      fetchSubAdmins();
    } catch (error) {
      toast.error('Failed to delete sub-admin');
    }
  };

  const handleResetPassword = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to reset the password for ${name}?`)) return;
    try {
      const result = await db.resetSubAdminPassword(id);
      toast.success('Password reset successfully');
      setCreatedCredentials({
        id: result.user_id,
        tempPass: result.temp_password,
        name: name
      });
      fetchSubAdmins();
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await db.toggleSubAdminStatus(id);
      toast.success('Status updated');
      fetchSubAdmins();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-4">Manage Sub-Admins</h2>

        {createdCredentials && (
          <div className="mb-8 p-6 bg-school-green-50 border-2 border-school-green-200 rounded-2xl relative">
            <button 
              onClick={() => setCreatedCredentials(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-lg font-bold text-school-green-800 mb-2">Credentials for {createdCredentials.name}</h3>
            <p className="text-sm text-school-green-700 mb-4">Please copy these credentials and share them securely. They will not be shown again.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-school-green-100">
                <span className="block text-xs font-bold text-gray-500 uppercase mb-1">User ID</span>
                <span className="font-mono text-lg font-medium text-gray-900">{createdCredentials.id}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-school-green-100">
                <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Temporary Password</span>
                <span className="font-mono text-lg font-medium text-gray-900">{createdCredentials.tempPass}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleCreate} className="flex gap-4 items-end mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              value={newAdminName} 
              onChange={(e) => setNewAdminName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-school-green-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. John Doe"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-3 bg-school-green-600 text-white font-bold rounded-xl hover:bg-school-green-700 disabled:opacity-50 transition-colors shadow-sm shadow-school-green-200"
          >
            {isSubmitting ? 'Creating...' : 'Create Sub-Admin'}
          </button>
        </form>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-school-green-200 border-t-school-green-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-700 text-sm">User ID</th>
                  <th className="px-6 py-4 font-bold text-gray-700 text-sm">Full Name</th>
                  <th className="px-6 py-4 font-bold text-gray-700 text-sm">Status</th>
                  <th className="px-6 py-4 font-bold text-gray-700 text-sm">Created</th>
                  <th className="px-6 py-4 font-bold text-gray-700 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subAdmins.map(admin => (
                  <tr key={admin.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900">{admin.user_id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{admin.full_name}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(admin.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${admin.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {admin.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(admin.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleResetPassword(admin.id, admin.full_name)}
                          className="text-school-green-600 hover:text-school-green-800 font-medium text-sm transition-colors"
                        >
                          Reset Password
                        </button>
                        <button 
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {subAdmins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No sub-admins found. Create one above to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
