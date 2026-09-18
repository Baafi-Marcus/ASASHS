import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import {
  ClipboardDocumentCheckIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const ACTION_LABELS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  deactivate: 'Deactivated',
  enable_maintenance: 'Maintenance ON',
  disable_maintenance: 'Maintenance OFF',
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-50 text-green-800 border-green-200',
  update: 'bg-blue-50 text-blue-800 border-blue-200',
  delete: 'bg-red-50 text-red-800 border-red-200',
  deactivate: 'bg-amber-50 text-amber-800 border-amber-200',
  enable_maintenance: 'bg-red-50 text-red-800 border-red-200',
  disable_maintenance: 'bg-green-50 text-green-800 border-green-200',
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
      setLogs(data || []);
      setTotal(count || 0);
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
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">System Security & Audit Trail</h2>
          <p className="text-xs text-gray-500 mt-0.5">Immutable record of administrative operations, record mutations, and system state changes</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={entityFilter} 
            onChange={e => { setEntityFilter(e.target.value); setPage(1); }} 
            className="border border-gray-300 rounded-sm px-2.5 py-1.5 text-xs bg-white"
          >
            <option value="">All Entity Types</option>
            <option value="student">Student Registry</option>
            <option value="teacher">Faculty Registry</option>
            <option value="exam">Examinations</option>
            <option value="system">System State</option>
          </select>
          <select 
            value={actionFilter} 
            onChange={e => { setActionFilter(e.target.value); setPage(1); }} 
            className="border border-gray-300 rounded-sm px-2.5 py-1.5 text-xs bg-white"
          >
            <option value="">All Action Types</option>
            <option value="create">Created</option>
            <option value="update">Updated</option>
            <option value="delete">Deleted</option>
            <option value="deactivate">Deactivated</option>
            <option value="enable_maintenance">Maintenance ON</option>
            <option value="disable_maintenance">Maintenance OFF</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton variant="table" rows={10} columns={5} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Actor / Admin</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Entity</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Operation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-gray-500 whitespace-nowrap tabular-nums">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{log.actor_name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold border ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium capitalize text-gray-700">{log.entity_type}</td>
                      <td className="px-4 py-3 text-gray-600 leading-relaxed">{log.details}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-xs">
                        No audit log entries matching the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
                <span className="text-xs text-gray-500 tabular-nums">
                  Page {page} of {totalPages} ({total} audit events recorded)
                </span>
                <div className="flex gap-1.5">
                  <button 
                    disabled={page <= 1} 
                    onClick={() => setPage(p => p - 1)} 
                    className="px-2.5 py-1 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-2xs"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={page >= totalPages} 
                    onClick={() => setPage(p => p + 1)} 
                    className="px-2.5 py-1 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-2xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AuditLogViewer;
