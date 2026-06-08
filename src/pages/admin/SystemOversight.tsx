import React, { useEffect, useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { AuthContext } from '../../../AuthContext';
import { AuditLogViewer } from './AuditLogViewer';

interface AnalyticsData {
  totalLoginsToday: number;
  activeSessions: number;
  systemPerformance: number;
  storageUsage: number;
  apiResponseTime: number;
  errorRate: number;
  userRegistrations: { date: string; count: number }[];
  peakUsageHours: { hour: number; count: number }[];
}

export default function SystemOversight() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceToggling, setMaintenanceToggling] = useState(false);
  const [currentAcademicYear, setCurrentAcademicYear] = useState('');
  const [currentSemester, setCurrentSemester] = useState(1);
  const [savingAY, setSavingAY] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    db.getMaintenanceMode().then(setMaintenanceMode).catch(() => {});
    db.getCurrentAcademicYear().then(setCurrentAcademicYear).catch(() => {});
    db.getCurrentSemester().then(setCurrentSemester).catch(() => {});
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch actual analytics data
      // For now, we'll generate realistic demo data
      
      // Generate user registration data
      const registrationData = [];
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        registrationData.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 15) + 5 // 5-20 registrations per day
        });
      }
      
      // Generate peak usage hours data
      const peakHours = [];
      for (let hour = 0; hour < 24; hour++) {
        peakHours.push({
          hour,
          count: hour >= 8 && hour <= 18 ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 30)
        });
      }
      
      setAnalytics({
        totalLoginsToday: Math.floor(Math.random() * 100) + 50,
        activeSessions: Math.floor(Math.random() * 50) + 20,
        systemPerformance: Math.floor(Math.random() * 30) + 70, // 70-100%
        storageUsage: Math.floor(Math.random() * 50) + 30, // 30-80%
        apiResponseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
        errorRate: Math.floor(Math.random() * 5), // 0-5%
        userRegistrations: registrationData,
        peakUsageHours: peakHours
      });
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">System Analytics</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded-lg text-sm ${
              timeRange === '7d' 
                ? 'bg-school-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 rounded-lg text-sm ${
              timeRange === '30d' 
                ? 'bg-school-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            30 Days
          </button>
          <button 
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1 rounded-lg text-sm ${
              timeRange === '90d' 
                ? 'bg-school-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-school-green-600 text-sm font-medium">Logins Today</p>
              <p className="text-3xl font-bold text-school-green-800">{analytics?.totalLoginsToday || 0}</p>
            </div>
            <div className="bg-school-green-100 p-3 rounded-lg">
              <span className="text-2xl">🔑</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-school-cream-700 text-sm font-medium">Active Sessions</p>
              <p className="text-3xl font-bold text-school-cream-800">{analytics?.activeSessions || 0}</p>
            </div>
            <div className="bg-school-cream-100 p-3 rounded-lg">
              <span className="text-2xl">🟢</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-school-green-600 text-sm font-medium">Performance</p>
              <p className="text-3xl font-bold text-school-green-800">{analytics?.systemPerformance || 0}%</p>
            </div>
            <div className="bg-school-green-100 p-3 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-school-cream-700 text-sm font-medium">Storage Used</p>
              <p className="text-3xl font-bold text-school-cream-800">{analytics?.storageUsage || 0}%</p>
            </div>
            <div className="bg-school-cream-100 p-3 rounded-lg">
              <span className="text-2xl">💾</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">User Registrations</h3>
          <div className="h-64 flex items-end space-x-1">
            {analytics?.userRegistrations.map((item, index) => {
              const maxCount = Math.max(...analytics.userRegistrations.map(u => u.count));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-school-green-500 rounded-t hover:bg-school-green-600 transition-colors"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {new Date(item.date).getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Peak Usage Hours</h3>
          <div className="h-64 flex items-end space-x-1">
            {analytics?.peakUsageHours.map((item, index) => {
              const maxCount = Math.max(...analytics.peakUsageHours.map(u => u.count));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-school-cream-500 rounded-t hover:bg-school-cream-600 transition-colors"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.hour}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Maintenance Mode</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700 font-medium">System Maintenance</p>
            <p className="text-sm text-gray-500">When enabled, only administrators can access the system. All other users will see a maintenance notice.</p>
          </div>
          <button
            onClick={async () => {
              setMaintenanceToggling(true);
              try {
                const newMode = await db.setMaintenanceMode(!maintenanceMode);
                setMaintenanceMode(newMode);
                await db.logAuditEvent({
                  actor_id: user?.user_id || 'unknown',
                  actor_name: user?.full_name || 'Unknown',
                  action: newMode ? 'enable_maintenance' : 'disable_maintenance',
                  entity_type: 'system',
                  details: `Maintenance mode ${newMode ? 'enabled' : 'disabled'}`
                });
              } catch (e) {
                console.error('Failed to toggle maintenance mode:', e);
              } finally {
                setMaintenanceToggling(false);
              }
            }}
            disabled={maintenanceToggling}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${maintenanceMode ? 'bg-red-500' : 'bg-gray-300'} ${maintenanceToggling ? 'opacity-50' : ''}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        {maintenanceMode && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">Maintenance mode is ACTIVE. Non-admin users cannot access the system.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Academic Year Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Academic Year</label>
            <input
              type="text"
              value={currentAcademicYear}
              onChange={(e) => setCurrentAcademicYear(e.target.value)}
              placeholder="e.g. 2025/2026"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
            <select
              value={currentSemester}
              onChange={(e) => setCurrentSemester(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
            >
              <option value={1}>Semester 1 (Sep–Feb)</option>
              <option value={2}>Semester 2 (Mar–Aug)</option>
            </select>
          </div>
        </div>
        <button
          onClick={async () => {
            setSavingAY(true);
            try {
              await db.setCurrentAcademicYear(currentAcademicYear);
              await db.setCurrentSemester(currentSemester);
              await db.logAuditEvent({
                actor_id: user?.user_id || 'unknown',
                actor_name: user?.full_name || 'Unknown',
                action: 'update_academic_settings',
                entity_type: 'system',
                details: `Academic year set to ${currentAcademicYear}, Semester ${currentSemester}`
              });
              toast.success('Academic year settings saved');
            } catch (e) {
              console.error('Failed to save academic settings:', e);
              toast.error('Failed to save settings');
            } finally {
              setSavingAY(false);
            }
          }}
          disabled={savingAY}
          className="px-6 py-2 bg-school-green-600 text-white rounded-xl font-bold hover:bg-school-green-700 transition-colors disabled:opacity-50"
        >
          {savingAY ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">System Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>API Response Time</span>
                <span>{analytics?.apiResponseTime || 0}ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-school-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (analytics?.apiResponseTime || 0) / 3)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Error Rate</span>
                <span>{analytics?.errorRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-school-cream-600 h-2 rounded-full"
                  style={{ width: `${(analytics?.errorRate || 0) * 20}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">System Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-school-green-600 text-white p-3 rounded-lg hover:bg-school-green-700 transition-colors text-left flex items-center">
              <span className="mr-2">📊</span> Generate Full Report
            </button>
            <button className="w-full bg-school-cream-600 text-white p-3 rounded-lg hover:bg-school-cream-700 transition-colors text-left flex items-center">
              <span className="mr-2">🔄</span> Run System Diagnostics
            </button>
            <button className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors text-left flex items-center">
              <span className="mr-2">📧</span> Email Report to Admin
            </button>
          </div>
        </div>
      </div>

      <AuditLogViewer />
    </div>
  );
}