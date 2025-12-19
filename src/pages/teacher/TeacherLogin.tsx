import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PortalInput } from '../../components/PortalInput';
import { PortalButton } from '../../components/PortalButton';

interface TeacherLoginProps {
  onLogin: (teacherId: string, password: string) => Promise<void>;
}

export const TeacherLogin: React.FC<TeacherLoginProps> = ({ onLogin }) => {
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherId.trim() || !password.trim()) {
      toast.error('Please enter both Teacher ID and password');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(teacherId.trim(), password);
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-cream-100 via-white to-school-green-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-school-cream-200 overflow-hidden">
          <div className="bg-gradient-to-r from-school-green-600 to-school-green-700 p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-2 rounded-xl shadow-lg">
                <img 
                  src="/asashs-logo.png" 
                  alt="ASASHS Logo" 
                  className="w-16 h-16 rounded-lg"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Teacher Portal</h1>
            <p className="text-school-green-100 mt-1">Akim Asafo Senior High School</p>
          </div>
          
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
              <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher ID</label>
                <PortalInput
                  type="text"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  placeholder="Enter your Teacher ID"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-school-green-600 hover:text-school-green-700"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <PortalInput
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full"
                />
              </div>

              <PortalButton
                type="submit"
                disabled={isLoading}
                className="w-full justify-center py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                size="lg"
                variant="primary"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </PortalButton>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact the school administration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};