// LoginForm.tsx
import React, { useState } from 'react';
import { PortalInput } from './src/components/PortalInput';
import { PortalButton } from './src/components/PortalButton';

interface LoginFormProps {
  onSubmit: (userId: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(userId, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4">
          <img 
            src="/asashs-logo.png" 
            alt="ASASHS Logo" 
            className="w-20 h-20 mx-auto rounded-xl shadow-md"
          />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Admin Portal</h2>
        <p className="text-gray-600 text-sm mt-1">Akim Asafo Senior High School</p>
      </div>
      
      <div>
        <PortalInput
          label="User ID"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          placeholder="Enter your Admin ID"
          className="py-3 px-4 text-base"
        />
      </div>
      
      <div>
        <PortalInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          className="py-3 px-4 text-base"
        />
      </div>
      
      <PortalButton
        type="submit"
        disabled={isLoading}
        className="w-full justify-center py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all"
        size="lg"
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
  );
};

export default LoginForm;