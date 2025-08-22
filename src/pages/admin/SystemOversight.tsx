export default function SystemOversight() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">System Oversight</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium">System Logs</h3>
          <p className="text-sm text-gray-500">Track user activity & login history.</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium">Usage Statistics</h3>
          <p className="text-sm text-gray-500">Monitor portal usage and trends.</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium">Announcements</h3>
          <p className="text-sm text-gray-500">Post updates visible to all users.</p>
        </div>
      </div>
    </div>
  );
}
