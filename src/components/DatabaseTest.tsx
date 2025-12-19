import React, { useState, useEffect } from 'react';
import { db } from '../../lib/neon';

export const DatabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    try {
      // Test a simple database query
      const result = await db.getStudents({ limit: 1 });
      setTestResult(`Database connection successful! Found ${result.length} student(s).`);
    } catch (error) {
      console.error('Database test failed:', error);
      setTestResult(`Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Database Connection Test</h2>
      <button
        onClick={testDatabaseConnection}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Database Connection'}
      </button>
      {testResult && (
        <div className="mt-4 p-3 rounded bg-white border">
          <p className={testResult.includes('successful') ? 'text-green-600' : 'text-red-600'}>
            {testResult}
          </p>
        </div>
      )}
    </div>
  );
};