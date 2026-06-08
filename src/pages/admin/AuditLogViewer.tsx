import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../../lib/neon';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

const ACTION_LABELS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  deactivate: 'Deactivated',
  enable_maintenance: 'Maintenance ON',
  disable_maintenance: 'Maintenance OFF',
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  deactivate: 'bg-yellow-100 text-yellow-800',
  enable_maintenance: 'bg-red-100 text-red-800',
  disable_maintenance: 'bg-green-100 text-green-800',
};

export function AuditLogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (entityFilter) filters.entity_type = entityFilter;
      if (actionFilter) filters.action = actionFilter;
      filters.limit = pageSize;
      filters.offset = (page - 1) * pageSize;
      const [data, count] = await Promise.all([
        db.getAuditLogs(filters),
        db.getAuditLogCount(filters)
      ]);
      setLogs(data);
      setTotal(count);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, entityFilter, actionFilter]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Audit Log</h2>
          <div className="flex gap-3">
            <select value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(1); }} className="border rounded-xl px-3 py-2 text-sm">
              <option value="">All Types</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="exam">Exam</option>
              <option value="system">System</option>
            </select>
            <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} className="border rounded-xl px-3 py-2 text-sm">
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="deactivate">Deactivate</option>
              <option value="enable_maintenance">Maintenance ON</option>
              <option value="disable_maintenance">Maintenance OFF</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton variant="table" rows={10} columns={5} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 rounded-l-xl text-sm font-semibold">Time</th>
                    <th className="px-4 py-3 text-sm font-semibold">Actor</th>
                    <th className="px-4 py-3 text-sm font-semibold">Action</th>
                    <th className="px-4 py-3 text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-sm font-semibold rounded-r-xl">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{log.actor_name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}`}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">{log.entity_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.details}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No audit log entries found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <span className="text-sm text-gray-500">Page {page} of {totalPages} ({total} entries)</span>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
