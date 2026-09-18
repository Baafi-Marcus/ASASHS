import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import {
  UserPlusIcon,
  ShieldCheckIcon,
  KeyIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { PortalButton } from '../../components/PortalButton';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

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
      setSubAdmins(admins || []);
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
    if (!window.confirm('Are you sure you want to delete this sub-admin account? This cannot be undone.')) return;
    try {
      await db.deleteSubAdmin(id);
      toast.success('Sub-admin account revoked');
      fetchSubAdmins();
    } catch (error) {
      toast.error('Failed to delete sub-admin');
    }
  };

  const handleResetPassword = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to generate a new password for ${name}?`)) return;
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
      toast.success('Account authorization status updated');
      fetchSubAdmins();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Sub-Administrator Role Delegation</h2>
          <p className="text-xs text-gray-500 mt-0.5">Provision and supervise administrative sub-accounts with scoped oversight permissions</p>
        </div>
      </div>

      {createdCredentials && (
        <div className="p-4 sm:p-5 bg-green-50/60 border border-green-200 rounded-md relative text-xs">
          <button 
            onClick={() => setCreatedCredentials(null)}
            className="absolute top-3.5 right-3.5 p-1 text-green-700 hover:text-green-900 hover:bg-green-100 rounded-sm"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheckIcon className="w-4 h-4 text-green-700" />
            <h3 className="font-bold text-green-900">Generated Credentials: {createdCredentials.name}</h3>
          </div>
          <p className="text-green-800 mb-3">Copy and deliver these credentials securely. The temporary key will not be displayed again.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div className="bg-white p-3 rounded-sm border border-green-200">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Administrative User ID</span>
              <span className="font-mono text-sm font-bold text-gray-900 tabular-nums">{createdCredentials.id}</span>
            </div>
            <div className="bg-white p-3 rounded-sm border border-green-200">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Temporary Access Key</span>
              <span className="font-mono text-sm font-bold text-gray-900 tabular-nums">{createdCredentials.tempPass}</span>
            </div>
          </div>
        </div>
      )}

      {/* Provision Sub-Admin Form Card */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 space-y-4">
        <div className="pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Provision Sub-Admin Officer</h3>
          <p className="text-xs text-gray-500 mt-0.5">Enter the full legal name of the delegated staff member to generate an authorized account</p>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 items-end text-xs">
          <div className="flex-1 w-full">
            <label className="block font-medium text-gray-700 mb-1">Officer Full Name *</label>
            <input 
              type="text" 
              value={newAdminName} 
              onChange={(e) => setNewAdminName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white"
              placeholder="e.g. Samuel Kofi Mensah"
              required
            />
          </div>
          <PortalButton 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2 bg-school-green-700 text-white rounded-sm font-medium hover:bg-school-green-800 disabled:opacity-40 transition-colors shadow-2xs"
          >
            {isSubmitting ? 'Provisioning...' : 'Provision Account'}
          </PortalButton>
        </form>
      </div>

      {/* Sub-Admins Directory */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Delegated Sub-Administrators</h3>
            <p className="text-xs text-gray-500 mt-0.5">Active delegated personnel with portal administration rights</p>
          </div>
          <span className="text-xs text-gray-500 tabular-nums font-mono">
            {subAdmins.length} registered
          </span>
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingSkeleton variant="table" rows={4} columns={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">User ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Officer Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Provisioned Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {subAdmins.map(admin => (
                  <tr key={admin.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-gray-900 tabular-nums">{admin.user_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{admin.full_name}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleToggleStatus(admin.id)}
                        className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold border transition-colors ${
                          admin.is_active 
                            ? 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100' 
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        }`}
                        title="Click to toggle account access"
                      >
                        {admin.is_active ? 'Active' : 'Revoked'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 tabular-nums">{new Date(admin.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleResetPassword(admin.id, admin.full_name)}
                          className="text-school-green-700 hover:text-school-green-900 font-medium transition-colors"
                        >
                          Reset Credentials
                        </button>
                        <button 
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 hover:text-red-800 font-medium transition-colors"
                        >
                          Revoke Access
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {subAdmins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-xs">
                      No sub-administrators provisioned. Use the form above to grant access.
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
