import React, { useState } from 'react';
import db from '../../lib/neon';

interface TesterSignupProps {
  onBack: () => void;
  onLogin: () => void;
}

export const TesterSignup: React.FC<TesterSignupProps> = ({ onBack, onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await db.createTesterAccount(name.trim(), email.trim());
      setCredentials(result);
    } catch (err: any) {
      setError(err.message || 'Failed to create test account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (credentials) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-cream-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-school-cream-200 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Account Created!</h2>
          <p className="text-gray-500">Share these credentials with the tester. They will be prompted to change password on first login.</p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-left border border-gray-200">
            <div>
              <span className="text-sm text-gray-500">Login ID</span>
              <p className="text-lg font-mono font-bold text-gray-900 break-all">{credentials.username}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Password</span>
              <p className="text-lg font-mono font-bold text-gray-900 break-all">{credentials.password}</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left">
            <strong>Note:</strong> This is a test account. All actions are visible and may be reset at any time. Do not enter real personal data.
          </div>
          <button
            onClick={onLogin}
            className="w-full px-6 py-3 bg-school-green-600 text-white rounded-xl font-bold hover:bg-school-green-700 transition-colors"
          >
            Go to Login
          </button>
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-school-cream-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-school-cream-200">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4">
            <img src="/asashs-logo.png" alt="ASASHS Logo" className="w-20 h-20 mx-auto rounded-xl shadow-md" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Test Account Signup</h2>
          <p className="text-gray-600 text-sm mt-1">Get credentials to explore ASASHS Portal</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-school-green-500 focus:border-transparent text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-school-green-500 focus:border-transparent text-base"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-school-green-600 text-white rounded-xl font-bold hover:bg-school-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Creating Account...
              </span>
            ) : (
              'Get Test Credentials'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mr-4">
            Back to Home
          </button>
          <button onClick={onLogin} className="text-sm text-school-green-600 hover:text-school-green-700 font-medium">
            Already have an account? Log in
          </button>
        </div>
      </div>
    </div>
  );
};
