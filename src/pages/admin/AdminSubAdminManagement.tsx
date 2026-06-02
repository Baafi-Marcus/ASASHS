import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';

export function AdminSubAdminManagement() {
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminName, setNewAdminName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.success(`Sub-Admin created! ID: ${newAdmin.user_id}, Temp Password: ${newAdmin.temp_password}`);
      setNewAdminName('');
      fetchSubAdmins();
    } catch (error) {
      toast.error('Failed to create sub-admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this sub-admin?')) return;
    try {
      await db.deleteSubAdmin(id);
      toast.success('Sub-admin deleted');
      fetchSubAdmins();
    } catch (error) {
      toast.error('Failed to delete sub-admin');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-4">Manage Sub-Admins</h2>
        <form onSubmit={handleCreate} className="flex gap-4 items-end mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              value={newAdminName} 
              onChange={(e) => setNewAdminName(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
              placeholder="e.g. John Doe"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2 bg-school-green-600 text-white rounded-xl hover:bg-school-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Sub-Admin'}
          </button>
        </form>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 rounded-l-xl">User ID</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subAdmins.map(admin => (
                  <tr key={admin.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{admin.user_id}</td>
                    <td className="px-4 py-3">{admin.full_name}</td>
                    <td className="px-4 py-3">{new Date(admin.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleDelete(admin.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {subAdmins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No sub-admins found</td>
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
